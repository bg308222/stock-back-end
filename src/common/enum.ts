export enum MethodEnum {
  BUY = 0,
  SELL = 1,
}

export enum SubMethodEnum {
  CANCEL = 0,
  UPDATE = 1,
}

export enum OrderStatusEnum {
  SUCCESS = 1,
  FAIL = 0,
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

export enum UpperLowerLimitEnum {
  LIMIT_UP = 0,
  LIMIT_DOWN = 1,
  SPACE = 2,
}

export enum QueryStrategyEnum {
  value = 0,
  inArray = 1,
  range = 2,
  fuzzy = 3,
}

export enum TrendFlagEnum {
  FALL = 0,
  RISE = 1,
  SPACE = 2,
}

export enum DateFormatEnum {
  MINUTE = 0,
  HOUR = 1,
  DAY = 2,
  SECOND = 3,
}

export enum SampleModeEnum {
  FIRST = 0,
  MAX = 1,
  MIN = 2,
  AVERAGE = 3,
}
