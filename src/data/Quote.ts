export interface QuoteFound {
  status: 'ok';
  ticker: string;
  price: number;
  change1h: number;
  change24h: number;
}

export interface QuoteNotFound {
  status: 'not_found';
  ticker: string;
}

export type Quote = QuoteFound | QuoteNotFound;
