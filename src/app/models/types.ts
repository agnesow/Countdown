export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export interface QuoteResponse {
  quote: string;
  author: string;
  id: number;
}
