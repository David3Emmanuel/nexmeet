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

// Theme interface goes here when we build Task 3.