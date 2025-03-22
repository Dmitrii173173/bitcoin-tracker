export interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CoindeskData {
  time: {
    updated: string;
    updatedISO: string;
  };
  bpi: {
    USD: {
      rate: string;
      rate_float: number;
    };
  };
} 