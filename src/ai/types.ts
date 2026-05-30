export interface EventInfo {
  title: string;
  about: string;
}

export interface FormQuestion {
  id: string;
  question: string;
  helperText: string;
}

export interface Attendee {
  id: string;
  name: string;
  lookingFor?: string;
  answers: Record<string, string>;  // questionId -> free-text answer
}

export interface AttendeeMatch {
  matchedAttendeeId: string;
  matchedName: string;
  reason: string;
  mutual?: boolean;   // true when both picked each other
}

export interface MatchResult {
  attendeeId: string;
  matches: AttendeeMatch[];
}
export interface Theme {
  background: string;        // page background, hex
  foreground: string;        // primary text on background, hex
  accent: string;            // brand/CTA color pulled from the flyer, hex
  accentForeground: string;  // text/icon color that sits ON accent, hex
  fontFamily: string;        // ready-to-use CSS font-family stack
  fontKind: "sans" | "serif" | "display" | "mono";  // which kind to load
  mood: string;              // one-line description of the vibe, for sanity-checking
}

// Theme interface goes here when we build Task 3.