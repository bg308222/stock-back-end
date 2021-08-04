export enum MethodEnum {
  BUY = 0,
  SELL = 1,
  CANCEL = 2,
  UPDATE = 3,
}

export enum PriceTypeEnum {
  MARKET = 0,
  LIMIT = 1,
}

export enum TimeRestrictiomEnum {
  ROD = 0,
  IOC = 1,
  FOK = 2,
}

export enum TransactionStatusEnum {
  PARTIAL = 0,
  FULL = 1,
}

export enum QueryStrategyEnum {
  value = 0,
  inArray = 1,
  range = 2,
  fuzzy = 3,
}
