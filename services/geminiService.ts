
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartTaskBreakdown = async (title: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `将此任务分解为 3-5 个可操作的、具体的子任务：标题："${title}"，描述："${description}"。请使用中文返回。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "任务的具体子步骤列表。"
            }
          },
          required: ["subTasks"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.subTasks as string[];
  } catch (error) {
    console.error("Gemini AI breakdown failed:", error);
    return ["审阅需求", "设定里程碑", "执行步骤"];
  }
};

export const getDailyQuote = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "生成一条简短、极具启发性的生产力语录及其作者。请使用中文。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["quote", "author"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { quote: "开始工作的最好方法是停止谈论，开始行动。", author: "华特·迪士尼" };
  }
};
