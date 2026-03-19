export interface Filing {
  id: string;
  ticker: string;
  companyName: string;
  formType: string;
  isAmendment: boolean;
  timestamp: string;
  filingUrl: string;
}

export type FormType = "10-K" | "10-Q" | "8-K" | "S-1" | "4" | "SC 13G" | "DEF 14A";

export const FORM_TYPES: FormType[] = ["10-K", "10-Q", "8-K", "S-1", "4", "SC 13G", "DEF 14A"];
