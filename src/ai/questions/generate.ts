import { Type } from '@google/genai'
import { ai } from '../clients'
import { EventInfo, FormQuestion } from '@/lib/types'
import { buildQuestionPrompt } from './prompts'

export async function generateFormQuestions(
  event: EventInfo,
  questionCount: number = 5,
): Promise<FormQuestion[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: buildQuestionPrompt(event, questionCount),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        minItems: questionCount,
        maxItems: questionCount,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            helperText: { type: Type.STRING },
          },
          required: ['id', 'question', 'helperText'],
        },
      },
    },
  })

  return (JSON.parse(response.text ?? '[]') as FormQuestion[]).slice(
    0,
    questionCount,
  )
}
