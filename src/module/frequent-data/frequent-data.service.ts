import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as fs from 'fs';
import { ITransferDisplay } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IFrequentDataQuery, IFrequentData } from './frequent-data.dto';

const FIELDS = [
  {
    header: '計數',
    key: 'count',
  },
  {
    header: '第一賣價',
    key: 'a1px',
  },
  {
    header: '第一賣價量',
    key: 'a1sz',
  },
  {
    header: '第二賣價',
    key: 'a2px',
  },
  {
    header: '第二賣價量',
    key: 'a2sz',
  },
  {
    header: '第三賣價',
    key: 'a3px',
  },
  {
    header: '第三賣價量',
    key: 'a3sz',
  },
  {
    header: '第四賣價',
    key: 'a4px',
  },
  {
    header: '第四賣價量',
    key: 'a4sz',
  },
  {
    header: '第五賣價',
    key: 'a5px',
  },
  {
    header: '第五賣價量',
    key: 'a5sz',
  },
  {
    header: '第一買價',
    key: 'b1px',
  },
  {
    header: '第一買價量',
    key: 'b1sz',
  },
  {
    header: '第二買價',
    key: 'b2px',
  },
  {
    header: '第二買價量',
    key: 'b2sz',
  },
  {
    header: '第三買價',
    key: 'b3px',
  },
  {
    header: '第三買價量',
    key: 'b3sz',
  },
  {
    header: '第四買價',
    key: 'b4px',
  },
  {
    header: '第四買價量',
    key: 'b4sz',
  },
  {
    header: '第五買價',
    key: 'b5px',
  },
  {
    header: '第五買價量',
    key: 'b5sz',
  },
  {
    header: '賣tick量',
    key: 'asz',
  },
  {
    header: '買tick量',
    key: 'bsz',
  },
  {
    header: '股票代碼',
    key: 'sym',
  },
  {
    header: '總比數',
    key: 'tickcnt',
  },
  {
    header: '交易日期',
    key: 'trdate',
  },
  {
    header: '交易時間',
    key: 'ts',
  },
];

@Injectable()
export class FrequentDataService {
  constructor(private readonly displayService: DisplayService) {}

  private async getDisplay(query: IFrequentDataQuery) {
    const { content: displays } = (await this.displayService.get({
      ...query,
      order: { order: 'ASC', orderBy: 'createdTime' },
    })) as {
      content: ITransferDisplay[];
      totalSize: number;
    };
    return displays;
  }

  private transferDisplayToFrequentData(displays: ITransferDisplay[]) {
    return displays.map(({ fiveTickRange, ...display }) => {
      const responseType: Partial<IFrequentData> = {
        sym: display.stockId,
        trdate: moment(display.createdTime).format('YYYYMMDD'),
        ts: moment(display.createdTime).format('HH:mm:ss'),
        asz: 0,
        bsz: 0,
        tickcnt: 0,
      };

      fiveTickRange.forEach(({ price, sellQuantity, buyQuantity }, index) => {
        const n = (index % 5) + 1;
        if (index < 5) {
          responseType[`a${n}px`] = price;
          responseType[`a${n}sz`] = sellQuantity;
          responseType.asz += sellQuantity;
          responseType.tickcnt += sellQuantity;
        } else {
          responseType[`b${n}px`] = price;
          responseType[`b${n}sz`] = buyQuantity;
          responseType.bsz += buyQuantity;
          responseType.tickcnt += buyQuantity;
        }
      });
      return responseType as IFrequentData;
    });
  }

  private writeFile(frequentDatas: IFrequentData[], path: string) {
    const headers = FIELDS.map((field) => field.key).join(',');
    console.log(path, 12321321);
    fs.writeFileSync(path, headers + '\n');
    frequentDatas.forEach((frequentData, count) => {
      const content = FIELDS.map((field, index) => {
        if (index === 0) return count;
        return frequentData[field.key];
      }).join(',');
      fs.appendFileSync(path, content + '\n');
    });
  }

  public removeFile(path: string) {
    fs.rmSync(path);
  }

  public async getFrequentData(query: IFrequentDataQuery) {
    const displays = await this.getDisplay(query);
    return this.transferDisplayToFrequentData(displays);
  }

  public async downloadFrequentData(query: IFrequentDataQuery) {
    const min =
      query.createdTime && query.createdTime.min
        ? moment(query.createdTime.min).format('YYYYMMDD') +
          moment(query.createdTime.min).format('HHmmss')
        : 't';
    const max =
      query.createdTime && query.createdTime.max
        ? moment(query.createdTime.max).format('YYYYMMDD') +
          moment(query.createdTime.max).format('HHmmss')
        : 't';

    const fileName = `${
      query.stockId
    }_${min}_${max}_${new Date().getMilliseconds()}.csv`;
    const path = `${__dirname}/${fileName}`;
    const displays = await this.getDisplay(query);
    this.writeFile(this.transferDisplayToFrequentData(displays), path);

    return path;
  }
}
