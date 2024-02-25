import { CmcQuotesData } from "./CmcQuotesData";
import { CmcStatus } from "./CmcStatus";

export interface CmcQuotesResponse {
  status: CmcStatus;
  data?: CmcQuotesData;
}
