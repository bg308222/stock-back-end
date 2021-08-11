import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  MethodEnum,
  OrderStatusEnum,
  PriceTypeEnum,
  SubMethodEnum,
  TimeRestrictiomEnum,
  TransactionStatusEnum,
  UpperLowerLimitEnum,
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
  type:
    | 'method'
    | 'subMethod'
    | 'priceType'
    | 'timeRestriction'
    | 'transactionStatus'
    | 'upperLowerLimit'
    | 'orderStatus',
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
      case 'subMethod': {
        return {
          enum: [SubMethodEnum.CANCEL, SubMethodEnum.UPDATE],
          description: 'CANCEL = 0, UPDATE = 1',
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
      case 'upperLowerLimit': {
        return {
          enum: [
            UpperLowerLimitEnum.LIMIT_UP,
            UpperLowerLimitEnum.LIMIT_DOWN,
            UpperLowerLimitEnum.SPACE,
          ],
          description: 'LIMIT_UP = 0, LIMIT_DOWN = 1, SPACE = 2',
          isArray: true,
        };
      }
      case 'orderStatus': {
        return {
          enum: [OrderStatusEnum.FAIL, OrderStatusEnum.SUCCESS],
          description: 'FAIL = 0, SUCCESS = 1',
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
      case 'subMethod': {
        return {
          description: 'CANCEL = 0, UPDATE = 1',
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
      case 'upperLowerLimit': {
        return {
          description: 'LIMIT_UP = 0, LIMIT_DOWN = 1, SPACE = 2',
          example: 0,
        };
      }
      case 'orderStatus': {
        return {
          description: 'FAIL = 0, SUCCESS = 1',
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
    type: 'number' | 'date' | 'string' | 'json' | 'array';
    option?: SchemaObject;
  }[],
) => {
  return input.reduce((p, { key, type, option }) => {
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
      case 'json': {
        p[key] = {
          type: 'object',
          description: 'object',
        };
      }
      case 'array': {
        p[key] = {
          type: 'array',
          example: [],
        };
      }
    }
    if (option) {
      p[key] = {
        ...p[key],
        ...option,
      };
    }
    return p;
  }, {} as Record<keyof T, SchemaObject>);
};
