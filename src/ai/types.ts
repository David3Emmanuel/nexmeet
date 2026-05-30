export interface EventInfo {
  title: string;
  about: string;
}

export interface FormQuestion {
  id: string;          // stable key for storing the answer, e.g. "q1"
  question: string;    // shown to the attendee
  helperText: string;  // one-line nudge under the input
}

// Match and Theme interfaces go here when we build Tasks 2 and 3.