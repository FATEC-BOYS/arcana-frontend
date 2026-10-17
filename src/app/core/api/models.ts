export type Status = "pending" | "processing" | "completed" | "failed";
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
export interface Card {
  id: string;
  name: string;
  arcana: "major" | "minor";
  suit: string | null;
  meaning: string;
}
export interface Source {
  source_id: string;
  source: string;
  text: string;
  document_version: string;
  license: string;
}
export interface Result {
  summary: string;
  reflections: string[];
  sources: Source[];
  reviewed: boolean;
}
export interface Draw {
  card_id: string;
  name: string;
  position: string;
  reversed: boolean;
}
export interface Reading {
  id: string;
  kind: "tarot" | "astrology";
  chart_id: string | null;
  question: string;
  facts: { cards?: Draw[]; chart?: ChartData };
  status: Status;
  result: Result | null;
  error_code: string | null;
  created_at: number;
}
export interface Message {
  id: string;
  sequence: number;
  question: string;
  status: Status;
  result: Result | null;
  error_code: string | null;
}
export interface Journal {
  reading_id: string;
  note: string;
  favorite: boolean;
}
export interface ChartData {
  birth_time_known: boolean;
  limitations: string[];
  svg: string | null;
  planets: Record<string, { sign: string; position: number }>;
}
export interface Chart {
  id: string;
  created_at: number;
  data: ChartData;
}
export interface ChartItem {
  id: string;
  created_at: number;
  birth_input: { birth_date: string; birth_time: string | null };
}
export interface Usage {
  resets_at: number;
  quotas: Record<string, { used: number; limit: number; remaining: number }>;
}
