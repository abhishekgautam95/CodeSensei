
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CodingProblem, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProblem = async (): Promise<CodingProblem> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: 'Generate a professional coding challenge. Make it logically deep (Medium/Hard). Include a field "industryContext" explaining how this logic is used in big tech. Difficulty: Medium. Provide 3 test cases.',
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          industryContext: { type: Type.STRING },
          inputFormat: { type: Type.STRING },
          outputFormat: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          testCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                input: { type: Type.STRING },
                expectedOutput: { type: Type.STRING }
              },
              required: ['input', 'expectedOutput']
            }
          }
        },
        required: ['title', 'description', 'industryContext', 'inputFormat', 'outputFormat', 'testCases']
      }
    }
  });

  return JSON.parse(response.text);
};

export const evaluateSolution = async (
  problem: CodingProblem, 
  code: string, 
  language: string
): Promise<EvaluationResult> => {
  const prompt = `
    JUDGE MODE:
    Problem: ${JSON.stringify(problem)}
    Solution: ${code}
    Lang: ${language}

    Evaluate:
    1. Logic correctness.
    2. Time/Space Complexity (Big O).
    3. Cleanliness (1-100).
    4. Hinglish feedback (Mix of Hindi/English).
    5. Optimization path.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          hint: { type: Type.STRING },
          timeComplexity: { type: Type.STRING },
          spaceComplexity: { type: Type.STRING },
          cleanlinessScore: { type: Type.NUMBER },
          optimization: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ['isCorrect', 'score', 'feedback', 'timeComplexity', 'spaceComplexity', 'cleanlinessScore']
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSenseiVoice = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Speak as a motivating coding mentor in a cool, calm tone. Use this script: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};

export const askSenseiHint = async (problem: CodingProblem, code: string, question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is stuck on this problem: ${problem.title}. Code so far: ${code}. They ask: "${question}". Give a subtle hint in Hinglish. DO NOT give the answer.`,
  });
  return response.text;
};
