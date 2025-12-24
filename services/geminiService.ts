import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export const generateLuxuryWish = async (recipient: string, tone: string = "warm"): Promise<string> => {
  try {
    const client = getAI();
    const prompt = `
      为“${recipient}”写一段简短的圣诞祝福，语气${tone}、优雅、具有电影感。
      面向移动端显示，字数不超过30个英文词。
      主题聚焦：光、温暖、团聚与宁静。
      禁止出现品牌或产品词，尤其不要包含“Arix Signature”和“Golden Pine”。
      不要使用表情符号。我要random的圣诞祝福语，用英文来写。
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        topK: 40,
      }
    });

    return response.text?.trim() || "May your holidays be filled with golden moments and eternal joy.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Wishing you a season of splendor and sophisticated joy.";
  }
};
