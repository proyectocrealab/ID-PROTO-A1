import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisState, AIInsight, ComparativeReport } from "../types";

const parseJSON = (text: string) => {
    try {
        // Simple cleanup to remove markdown code blocks if present
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return null;
    }
}

export const generateInsights = async (data: AnalysisState): Promise<AIInsight | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return {
        opportunities: ["API Key missing - cannot generate insights."],
        threats: [],
        strategicAdvice: "Please configure your environment variables.",
        dataQualityScore: 0,
        dataQualityFeedback: "No API key provided."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze the following Business Model Environment data based on Osterwalder's framework.
    
    Data:
    ${JSON.stringify(data, null, 2)}

    Tasks:
    1. Analyze the input data to identify Opportunities and Threats.
    2. Provide Strategic Advice.
    3. Grade the user's data input quality from 0 to 100.
       - Logic: 0 = No data. 100 = Excellent depth, with at least ~6 relevant, specific data points/insights provided per category (Key Trends, Market Forces, Industry Forces, Macro-Economic Forces).
       - Evaluate RELEVANCE to the 'description' (Project Context). Irrelevant data should not count towards the score.
    
    Output JSON format:
    {
      "opportunities": ["string", "string", ...],
      "threats": ["string", "string", ...],
      "strategicAdvice": "string (concise paragraph)",
      "dataQualityScore": number (0-100),
      "dataQualityFeedback": "string (brief explanation of the score and tips to improve)"
    }
    
    Focus on connecting dots between different quadrants. Keep items concise and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                opportunities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                threats: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                strategicAdvice: {
                    type: Type.STRING
                },
                dataQualityScore: {
                    type: Type.INTEGER
                },
                dataQualityFeedback: {
                    type: Type.STRING
                }
            }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return parseJSON(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateComparativeReport = async (analyses: AnalysisState[]): Promise<ComparativeReport | null> => {
    if (!process.env.API_KEY) return null;
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Prepare a summarized version of the data to save tokens, only sending non-empty fields
    const cleanData = analyses.map((a, index) => ({
        id: index + 1,
        author: a.author,
        description: a.description,
        data: {
            keyTrends: a.keyTrends,
            marketForces: a.marketForces,
            industryForces: a.industryForces,
            macroEconomicForces: a.macroEconomicForces
        }
    }));

    const prompt = `
      Perform a comparative statistical analysis on the following ${analyses.length} Business Model Environment datasets.
      
      Datasets:
      ${JSON.stringify(cleanData, null, 2)}

      Tasks:
      1. Identify recurring themes and patterns across the datasets (e.g., "AI Regulation appeared in 80% of analyses").
      2. Spot significant outliers or unique inputs.
      3. Create a statistical summary of the most frequent topics.

      Output JSON format:
      {
        "executiveSummary": "A paragraph summarizing the overall findings.",
        "commonPatterns": ["string", "string"],
        "outliers": ["string", "string"],
        "aggregatedStats": [
            { "label": "Topic/Keyword", "count": number (occurrences), "description": "Brief context" }
        ]
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for better reasoning over multiple files
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        commonPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                        outliers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        aggregatedStats: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    count: { type: Type.NUMBER },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const text = response.text;
        if (!text) return null;
        return parseJSON(text);
    } catch (error) {
        console.error("Gemini Comparative Error", error);
        return null;
    }
}