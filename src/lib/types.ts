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

export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export const APPLICATION_STAGES: ReadonlyArray<{
  id: ApplicationStatus;
  label: string;
  color: string;
}> = [
  { id: "applied", label: "Applied", color: "bg-blue-50 border-blue-200" },
  { id: "screening", label: "Screening", color: "bg-blue-100 border-blue-300" },
  { id: "interview", label: "Interview", color: "bg-indigo-100 border-indigo-300" },
  { id: "offer", label: "Offer", color: "bg-cyan-100 border-cyan-300" },
  { id: "hired", label: "Hired", color: "bg-emerald-100 border-emerald-300" },
  { id: "rejected", label: "Rejected", color: "bg-rose-100 border-rose-300" },
] as const;

export type CompanyRole = "admin" | "owner";

export type UserRole = "owner" | "member" | "viewer";

export type UserStatus = "active" | "invited" | "disabled";
