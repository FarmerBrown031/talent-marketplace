export interface CustomQuestion {
  label: string;
  type: "text" | "textarea" | "file";
}

export interface WorkHistoryEntry {
  company: string;
  role: string;
  years: number;
}

export interface CustomAnswer {
  questionLabel: string;
  answer: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export type JobType = "remote" | "onsite" | "hybrid";

export type JobStatus = "open" | "closed";

export type ApplicationStatus = "new" | "reviewed" | "hired" | "rejected";
