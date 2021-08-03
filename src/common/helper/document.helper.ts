import { MethodEnum, PriceTypeEnum, TimeRestrictiomEnum } from '../enum';

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
  type: 'method' | 'priceType' | 'timeRestriction',
  isArray = true,
) => {
  if (isArray) {
    switch (type) {
      case 'method': {
        return {
          enum: [MethodEnum.BUY, MethodEnum.SELL],
          description: 'BUY = 0, SELL = 1',
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
    }
  }
};

export const getPageDescription = () => {
  return {
    type: String,
    description: 'JSON string of {page: number; pageSize: number}',
  };
};
