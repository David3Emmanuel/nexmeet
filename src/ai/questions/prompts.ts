import { EventInfo } from "@/lib/types";

export function buildQuestionPrompt(event: EventInfo, count: number): string {
  return `You are designing the sign-up form for NexMeet, an AI networking app. The answers to these questions will later be fed to an AI that matches each attendee with the most valuable people for them to meet at this specific event.

EVENT
Title: ${event.title}
About: ${event.about}

STEP 1 — Infer the event. Work out what kind of event this is and who attends (e.g. startup pitch night, academic conference, hiring fair, hobbyist meetup). Your questions MUST fit that context: a VC pitch night and a fan convention should not get the same form.

STEP 2 — Write exactly ${count} open-ended, free-text questions. Every question must:
- Be answerable in 1 to 3 sentences and feel fast to fill out.
- Surface signal an AI can match on: what they do, what they are working on, what they want out of this event, and what they can offer others.
- Favour COMPLEMENTARY signal over shared interests, so matches can be built on mutual value (one person needs X, another provides X), not just "you both like X."

Do NOT ask for:
- Name, email, phone, or any contact details.
- "Who do you want to meet" directly (the AI infers this).
- Anything already obvious from the event description.

For each question, also write a short one-line helperText that nudges the attendee toward a specific, useful answer.

Return exactly ${count} questions.`;
}