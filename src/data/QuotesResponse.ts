import { QuotesData } from "./QuotesData";

export interface QuotesResponse {
  statusCode: number;
  message?: string;
  data?: QuotesData;
}
