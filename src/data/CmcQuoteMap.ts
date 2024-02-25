import { CmcQuote } from "./CmcQuote";

export interface CmcQuoteMap {
  USD: CmcQuote;
  [conversion: string]: CmcQuote;
}
