import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Experiment } from "../types";

// Note: In a real app, strict error handling for missing keys is needed.
// For this prototype, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeExperimentText = async (text: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key found");
    return {
      summary: "API Key missing. Cannot generate insights.",
      entities: [],
      anomalies: [],
      suggestions: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following experiment documentation. 
      1. Extract Named Entities (Genes, Proteins, Reagents, Equipment, Cell Lines).
      2. Provide a concise summary of the experiment status and findings.
      3. Identify any anomalies, errors, or unexpected results mentioned.
      4. Suggest next steps or improvements based on the context.
      
      Experiment Text:
      "${text}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                }
              }
            },
            anomalies: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Analysis failed due to an error.",
      entities: [],
      anomalies: ["Service Unavailable"],
      suggestions: []
    };
  }
};

export const chatWithData = async (history: {role: 'user' | 'model', content: string}[], newMessage: string) => {
    if (!apiKey) return "API Key missing.";
    
    try {
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: `You are a helpful AI lab assistant for an ELN. Be concise, scientific, and precise.
                
                You can suggest actions to the user using special Call-to-Action (CTA) syntax. 
                If appropriate, suggest a next step using: [[CTA: Label | ViewName | ParamsJSON]].
                
                ViewNames are: dashboard, experiments, inventory, molecular, analytics, auditLog.
                
                Examples:
                - "I can help you start a new experiment template." [[CTA: Create New Experiment | experiments | {"openCreate": true}]]
                - "Check your inventory for low stock reagents." [[CTA: Open Inventory | inventory | {"tab": "list"}]]
                - "View your equipment bookings here." [[CTA: Manage Equipment | inventory | {"tab": "equipment"}] ]
                - "Check the molecular tools for CRISPR design." [[CTA: Open Molecular Tools | molecular | {}]]`
            },
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        });
        
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (e) {
        console.error(e);
        return "I encountered an error processing your request.";
    }
}

export const generateExperimentPlan = async (prompt: string): Promise<Partial<Experiment>> => {
   if (!apiKey) return { title: "API Key Missing", content: "", protocolSteps: [], tags: [] };

   try {
     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a detailed laboratory experiment plan based on the following request: "${prompt}".
        Provide a scientific title, a list of protocol steps, relevant tags, and an initial background/observation section formatted in Markdown.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    content: { type: Type.STRING, description: "Background info or initial observations in Markdown" },
                    protocolSteps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                instruction: { type: Type.STRING },
                            }
                        }
                    }
                }
            }
        }
     });
     
     const resultText = response.text || "{}";
     return JSON.parse(resultText);
   } catch (error) {
     console.error("Experiment Generation Failed", error);
     // Return a fallback partial object
     return {
        title: "Generation Failed",
        content: "Could not generate experiment content.",
        tags: [],
        protocolSteps: []
     };
   }
}

export const refineLabNotes = async (text: string, mode: 'fix' | 'scientific' | 'expand'): Promise<string> => {
   if (!apiKey) return text;
   
   const prompts = {
       fix: "Fix grammar, spelling, and punctuation in the following lab notes. Do not change the scientific meaning.",
       scientific: "Rewrite the following lab notes to be more formal, objective, and compliant with scientific standards.",
       expand: "Expand the following brief lab notes into detailed observation sentences, inferring standard procedures where context implies."
   };

   try {
     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${prompts[mode]}:\n\n"${text}"`,
        config: {
            responseMimeType: "text/plain",
        }
     });
     
     return response.text || text;
   } catch (error) {
     console.error("Refine Text Failed", error);
     return text;
   }
}

export const generateLabOverview = async (experiments: any[], samples: any[], machines: any[]): Promise<string> => {
   if (!apiKey) return "API Key missing.";

   // Summarize data to reduce context size
   const exps = experiments.slice(0, 20).map(e => `[${e.id}] ${e.title} - Status: ${e.status}. Content snippet: ${e.content.slice(0, 100)}...`);
   const inv = samples.filter((s: any) => s.quantity.includes('0.') || s.quantity.includes('uL') || s.quantity.includes('units') && parseInt(s.quantity) < 5).map((s: any) => `${s.name} (${s.quantity})`); 
   const eq = machines.filter((m: any) => m.status !== 'Available').map((m: any) => `${m.name}: ${m.status}`);

   try {
     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          As a Senior Research Operations Analyst, provide a comprehensive executive summary of the lab's current state based on the provided data.
          
          Data Provided:
          - Recent Experiments: ${exps.join(' | ')}
          - Critically Low Inventory: ${inv.join(', ')}
          - Equipment Status: ${eq.join(', ')}

          Your report MUST include:
          1. **Executive Overview**: High-level summary of lab productivity.
          2. **Key Scientific Insights**: Trends in experiment success/failures or significant findings.
          3. **Operational Bottlenecks & Anomalies**: Mention "unworthy" or problematic data points, specific broken equipment, or inventory risks.
          4. **Strategic Recommendations**: 2-3 actionable next steps to improve efficiency.

          Format with Markdown headers (###) and bullet points. Be precise, professional, and insightful.
        `,
        config: {
            responseMimeType: "text/plain",
        }
     });
     
     return response.text || "Unable to generate summary.";
   } catch (error) {
     console.error("Summary Generation Failed", error);
     return "Analysis currently unavailable.";
   }
}