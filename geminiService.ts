import { GoogleGenAI, Type } from "@google/genai";
import { Trip } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getComplianceInsights = async (trips: Trip[]) => {
  const prompt = `Analyze the following IFTA trip logs for potential audit risks or data inconsistencies. 
  The fleet is operating under 2026 tax rates.
  
  Trip Data:
  ${JSON.stringify(trips)}
  
  Please provide:
  1. A risk level assessment for an IFTA audit.
  2. A concise summary explaining the data (focus on MPG consistency and jurisdiction distribution).
  3. Actionable recommendations for the carrier.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: 'Low, Medium, or High' },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['riskLevel', 'summary', 'recommendations']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      riskLevel: 'Unknown',
      summary: 'The AI audit scanner encountered an error and could not complete the analysis.',
      recommendations: [
        'Ensure you have imported valid data before scanning.',
        'Verify your network connection.',
        'Manually audit the Fuel Consumed (FJ) vs Fuel Purchased (FPJ) discrepancies.'
      ]
    };
  }
};