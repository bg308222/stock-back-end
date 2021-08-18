import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  getRangeDescription,
  getResponseProperties,
} from 'src/common/helper/document.helper';
import { IRange } from 'src/common/type';

export class IFrequentDataQuery {
  @ApiPropertyOptional(getRangeDescription(false))
  createdTime?: IRange<string>;

  @ApiProperty({ required: true })
  stockId: number;
}

export interface IFrequentData {
  sym: number;
  tickcnt: number;
  trdate: string;
  ts: string;
  a1px: number;
  a1sz: number;
  a2px: number;
  a2sz: number;
  a3px: number;
  a3sz: number;
  a4px: number;
  a4sz: number;
  a5px: number;
  a5sz: number;
  b1px: number;
  b1sz: number;
  b2px: number;
  b2sz: number;
  b3px: number;
  b3sz: number;
  b4px: number;
  b4sz: number;
  b5px: number;
  b5sz: number;
  asz: number;
  bsz: number;
}

export const IFrequentDataObjectResponse = {
  type: 'object',
  properties: getResponseProperties([
    {
      key: 'sym',
      type: 'number',
    },
    {
      key: 'tickcnt',
      type: 'number',
    },
    {
      key: 'trdate',
      type: 'string',
    },
    {
      key: 'ts',
      type: 'string',
    },
    {
      key: 'a1px',
      type: 'number',
    },
    {
      key: 'a1sz',
      type: 'number',
    },
    {
      key: 'a2px',
      type: 'number',
    },
    {
      key: 'a2sz',
      type: 'number',
    },
    {
      key: 'a3px',
      type: 'number',
    },
    {
      key: 'a3sz',
      type: 'number',
    },
    {
      key: 'a4px',
      type: 'number',
    },
    {
      key: 'a4sz',
      type: 'number',
    },
    {
      key: 'a5px',
      type: 'number',
    },
    {
      key: 'a5sz',
      type: 'number',
    },
    {
      key: 'b1px',
      type: 'number',
    },
    {
      key: 'b1sz',
      type: 'number',
    },
    {
      key: 'b2px',
      type: 'number',
    },
    {
      key: 'b2sz',
      type: 'number',
    },
    {
      key: 'b3px',
      type: 'number',
    },
    {
      key: 'b3sz',
      type: 'number',
    },
    {
      key: 'b4px',
      type: 'number',
    },
    {
      key: 'b4sz',
      type: 'number',
    },
    {
      key: 'b5px',
      type: 'number',
    },
    {
      key: 'b5sz',
      type: 'number',
    },
    {
      key: 'asz',
      type: 'number',
    },
    {
      key: 'bsz',
      type: 'number',
    },
  ]),
};
