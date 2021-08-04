import {
  MethodEnum,
  PriceTypeEnum,
  TimeRestrictiomEnum,
  TransactionStatusEnum,
} from '../enum';

export const getRangeDescription = (isNumber = true) => {
  if (isNumber) {
    return {
      type: String,
      description: 'JSON string of {min?: number; max?: number}',
    };
  } else {
    return {
      type: String,
      description: 'JSON string of {min?: string; max?: string}',
    };
  }
};

export const getEnumDescription = (
  type: 'method' | 'priceType' | 'timeRestriction' | 'transactionStatus',
  isArray = true,
) => {
  if (isArray) {
    switch (type) {
      case 'method': {
        return {
          enum: [MethodEnum.BUY, MethodEnum.SELL],
          description: 'BUY = 0, SELL = 1, CANCEL = 2, UPDATE = 3',
          isArray: true,
        };
      }
      case 'priceType': {
        return {
          enum: [PriceTypeEnum.MARKET, PriceTypeEnum.LIMIT],
          description: 'MARKET = 0, LIMIT = 1',
          isArray: true,
        };
      }
      case 'timeRestriction': {
        return {
          enum: [
            TimeRestrictiomEnum.ROD,
            TimeRestrictiomEnum.IOC,
            TimeRestrictiomEnum.FOK,
          ],
          description: 'ROD = 0, IOC = 1, FOK = 2',
          isArray: true,
        };
      }
      case 'transactionStatus': {
        return {
          enum: [TransactionStatusEnum.PARTIAL, TransactionStatusEnum.FULL],
          description: 'PARTIAL = 0, FULL = 1',
          isArray: true,
        };
      }
    }
  } else {
    switch (type) {
      case 'method': {
        return {
          description: 'BUY = 0, SELL = 1',
          example: 0,
        };
      }
      case 'priceType': {
        return {
          description: 'MARKET = 0, LIMIT = 1',
          example: 0,
        };
      }
      case 'timeRestriction': {
        return {
          description: 'ROD = 0, IOC = 1, FOK = 2',
          example: 0,
        };
      }
      case 'transactionStatus': {
        return {
          description: 'PARTIAL = 0, FULL = 1',
          example: 0,
        };
      }
    }
  }
};

export const getPageDescription = () => {
  return {
    type: String,
    description: 'JSON string of {page: number; pageSize: number}',
  };
};

export const getResponseProperties = <T = any>(
  input: {
    key: keyof T;
    type: 'number' | 'date' | 'string';
  }[],
) => {
  return input.reduce((p, { key, type }) => {
    switch (type) {
      case 'number': {
        p[key] = {
          type: 'number',
          example: 1,
        };
        break;
      }
      case 'date': {
        p[key] = {
          type: 'string',
          example: '2021-08-03T08:18:14.927Z',
        };
        break;
      }
      case 'string': {
        p[key] = {
          type: 'string',
          example: 'any string',
        };
      }
    }
    return p;
  }, {} as any);
};
