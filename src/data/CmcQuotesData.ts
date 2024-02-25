import { CmcCurrency } from "./CmcCurrency";

export interface CmcQuotesData {
  [symbol: string]: CmcCurrency | CmcCurrency[];
}
