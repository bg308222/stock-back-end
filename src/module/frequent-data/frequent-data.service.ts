import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as fs from 'fs';
import { ITransferDisplay } from '../display/display.dto';
import { DisplayService } from '../display/display.service';
import { IFrequentDataQuery, IFrequentData } from './frequent-data.dto';
import { SampleModeEnum } from 'src/common/enum';

const FIELDS = [
  'count',
  'mthpx',
  'mthsz',
  'a1px',
  'a1sz',
  'a2px',
  'a2sz',
  'a3px',
  'a3sz',
  'a4px',
  'a4sz',
  'a5px',
  'a5sz',
  'b1px',
  'b1sz',
  'b2px',
  'b2sz',
  'b3px',
  'b3sz',
  'b4px',
  'b4sz',
  'b5px',
  'b5sz',
  'asz',
  'bsz',
  'sym',
  'tickcnt',
  'trdate',
  'ts',
];

@Injectable()
export class FrequentDataService {
  constructor(private readonly displayService: DisplayService) {}

  private async getDisplay(
    query: IFrequentDataQuery,
  ): Promise<ITransferDisplay[]> {
    const displays = await this.displayService.getFrequentData(query);
    const { dateFormat, sampleMode } = query;
    if (isNaN(dateFormat)) return displays;

    let reduceTransferDisplay: Record<
      string,
      ITransferDisplay & { isAverage?: boolean }
    >;
    switch (sampleMode) {
      case SampleModeEnum.FIRST: {
        reduceTransferDisplay = displays.reduce<
          Record<string, ITransferDisplay>
        >((p, display) => {
          const { createdTime } = display;
          if (!p[createdTime]) p[createdTime] = { ...display };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MAX: {
        reduceTransferDisplay = displays.reduce<
          Record<string, ITransferDisplay>
        >((p, display) => {
          const { createdTime } = display;
          if (!p[createdTime]) p[createdTime] = { ...display };
          else if (display.matchPrice > p[createdTime].matchPrice)
            p[createdTime] = { ...display };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MIN: {
        reduceTransferDisplay = displays.reduce<
          Record<string, ITransferDisplay>
        >((p, display) => {
          const { createdTime } = display;
          if (!p[createdTime]) p[createdTime] = { ...display };
          else if (display.matchPrice < p[createdTime].matchPrice)
            p[createdTime] = { ...display };
          return p;
        }, {});
        break;
      }
      default: {
        reduceTransferDisplay = displays.reduce<
          Record<string, ITransferDisplay & { isAverage?: boolean }>
        >((p, display) => {
          if (display.matchQuantity === 0) return p;
          const { createdTime } = display;
          if (!p[createdTime]) {
            p[createdTime] = { ...display };
            p[createdTime].isAverage = true;
          } else {
            p[createdTime].matchPrice +=
              display.matchPrice * display.matchQuantity;
            p[createdTime].matchQuantity += display.matchQuantity;
          }
          return p;
        }, {});
        break;
      }
    }

    return Object.values(reduceTransferDisplay).map(
      ({ isAverage, ...display }) => {
        if (isAverage && display.matchQuantity !== 0)
          display.matchPrice = display.matchPrice / display.matchQuantity;
        return display;
      },
    );
  }

  private getFields(fields?: string[]) {
    if (!fields) return FIELDS;
    return FIELDS.filter((field) => {
      return fields.includes(field);
    });
  }

  private transferDisplayToFrequentData(
    displays: ITransferDisplay[],
    fields?: string[], // TODO field hidden
  ) {
    return displays.map(({ fiveTickRange, ...display }) => {
      const responseType: Partial<IFrequentData> = {
        sym: display.stockId,
        trdate: moment(display.createdTime).format('YYYYMMDD'),
        ts: moment(display.createdTime).format('HH:mm:ss'),
        mthpx: display.matchPrice,
        mthsz: display.matchQuantity,
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
      return responseType;
    });
  }

  private writeFile(
    displays: ITransferDisplay[],
    path: string,
    fields?: string[],
  ) {
    const frequentDatas = this.transferDisplayToFrequentData(displays);
    const displayFields = this.getFields(fields);

    const headers = displayFields.join(',');
    fs.writeFileSync(path, headers + '\n');
    frequentDatas.forEach((frequentData, count) => {
      const content = displayFields
        .map((displayField, index) => {
          if (index === 0) return count;
          return frequentData[displayField];
        })
        .join(',');
      fs.appendFileSync(path, content + '\n');
    });
  }

  public removeFile(path: string) {
    fs.rmSync(path);
  }

  public async getFrequentData(query: IFrequentDataQuery) {
    const displays = await this.getDisplay(query);
    return this.transferDisplayToFrequentData(displays, query.fields);
  }

  public async downloadFrequentData(query: IFrequentDataQuery) {
    const min =
      query.createdTime && query.createdTime.min
        ? moment(query.createdTime.min).format('YYYYMMDD') +
          moment(query.createdTime.min).format('HHmmss')
        : 'x';
    const max =
      query.createdTime && query.createdTime.max
        ? moment(query.createdTime.max).format('YYYYMMDD') +
          moment(query.createdTime.max).format('HHmmss')
        : 'x';

    const mode =
      query.dateFormat !== undefined
        ? `${query.dateFormat}${
            query.sampleMode !== undefined ? query.sampleMode : 'x'
          }`
        : 'xx';

    const timeStamp = new Date().getTime();

    const fileName = `${query.stockId}_${min}_${max}_${mode}_${timeStamp}.csv`;
    const path = `${__dirname}/${fileName}`;
    const displays = await this.getDisplay(query);
    this.writeFile(displays, path, query.fields);

    return path;
  }
}
