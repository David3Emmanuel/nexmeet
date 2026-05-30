import { generateFormQuestions } from './src/ai/questions/generate';

async function main() {
  const q = await generateFormQuestions({ title: "Hackathon", about: "A coding event" }, 5);
  console.log(`Generated ${q.length} questions`);
}
main().catch(console.error);
