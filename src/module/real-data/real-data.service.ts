import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RealDataDisplay } from 'src/common/entity/realDataDisplay.entity';
import { RealDataDisplayContent } from 'src/common/entity/realDataDisplayContent.entity';
import { RealDataOrder } from 'src/common/entity/realDataOrder.entity';
import { RealDataOrderContent } from 'src/common/entity/realDataOrderContent.entity';
import { DateFormatEnum, SampleModeEnum } from 'src/common/enum';
import {
  getDateFormatString,
  getQueryBuilderContent,
} from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  IRealDataDisplayContentInsert,
  IRealDataDisplayContentQuery,
  IRealDataDisplayContentSchema,
  IRealDataOrderContentInsert,
  IRealDataOrderContentQuery,
  IRealDataQuery,
  realDataOrderContentQueryStrategy,
  realDataQueryStrategy,
} from './real-data-dto';
import * as moment from 'moment';
import * as fs from 'fs';

const DISPLAY_SELECT = [
  'id',
  'sym',
  'mthpx',
  'mthsz',
  'bsz',
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
];

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
  'trdate',
  'ts',
];

@Injectable()
export class RealDataService {
  constructor(
    @InjectRepository(RealDataOrder)
    private readonly realDataOrderRepository: Repository<RealDataOrder>,
    @InjectRepository(RealDataOrderContent)
    private readonly realDataOrderContentRepository: Repository<RealDataOrderContent>,
    @InjectRepository(RealDataDisplay)
    private readonly realDataDisplayRepository: Repository<RealDataDisplay>,
    @InjectRepository(RealDataDisplayContent)
    private readonly realDataDisplayContentRepository: Repository<RealDataDisplayContent>,
  ) {}

  public async getOrder(query: IRealDataQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<RealDataOrder>(
        'realDataOrder',
        this.realDataOrderRepository.createQueryBuilder('realDataOrder'),
        realDataQueryStrategy,
        query,
      );

    const content = await fullQueryBuilder.getMany();
    return {
      content,
      totalSize,
    };
  }

  public async insertOrder(id: string) {
    const realDataOrder = new RealDataOrder();
    realDataOrder.id = id;
    await this.realDataOrderRepository.insert(realDataOrder);
    return true;
  }

  public async toggleOrderStatus(id: string) {
    const realDataOrder = await this.realDataOrderRepository.findOne({ id });
    if (!realDataOrder) throw new BadRequestException("Id doesn't exist");

    realDataOrder.isFinished = 1;
    await this.realDataOrderRepository.save(realDataOrder);
    return true;
  }

  public async deleteOrder(id: string[]) {
    if (id && id.length) {
      await this.realDataOrderRepository.delete(id);
      return true;
    }
    return false;
  }

  public async getOrderContent(query: IRealDataOrderContentQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<RealDataOrderContent>(
        'realDataOrderContent',
        this.realDataOrderContentRepository.createQueryBuilder(
          'realDataOrderContent',
        ),
        realDataOrderContentQueryStrategy,
        query,
      );

    const content = await fullQueryBuilder.getMany();
    return {
      content,
      totalSize,
    };
  }

  public async insertOrderContent(body: IRealDataOrderContentInsert) {
    await this.realDataOrderContentRepository.insert(
      body.map(({ realDataOrderId, ...v }) => {
        return {
          ...v,
          realDataOrder: { id: realDataOrderId },
        };
      }),
    );
    return true;
  }

  public async getDisplay(query: IRealDataQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<RealDataDisplay>(
        'realDataDisplay',
        this.realDataDisplayRepository.createQueryBuilder('realDataDisplay'),
        realDataQueryStrategy,
        query,
      );

    const content = await fullQueryBuilder.getMany();
    return {
      content,
      totalSize,
    };
  }

  public async insertDisplay(id: string) {
    const realDataDisplay = new RealDataDisplay();
    realDataDisplay.id = id;
    await this.realDataDisplayRepository.insert(realDataDisplay);
    return true;
  }

  public async toggleDisplayStatus(id: string) {
    const realDataDisplay = await this.realDataDisplayRepository.findOne({
      id,
    });
    if (!realDataDisplay) throw new BadRequestException("Id doesn't exist");

    realDataDisplay.isFinished = 1;
    await this.realDataDisplayRepository.save(realDataDisplay);
    return true;
  }

  public async deleteDisplay(id: string[]) {
    if (id && id.length) {
      await this.realDataDisplayRepository.delete(id);
      return true;
    }
    return false;
  }

  private async getOriginDisplayContent({
    stockId,
    createdTime,
    dateFormat,
  }: IRealDataDisplayContentQuery) {
    if (!stockId) throw new BadRequestException('Missing stockId');

    const queryBuilder =
      this.realDataDisplayContentRepository.createQueryBuilder('display');

    queryBuilder.select('display.id', 'id');
    DISPLAY_SELECT.forEach((select) => {
      queryBuilder.addSelect(`display.${select}`, select);
    });
    queryBuilder.addSelect(
      `DATE_FORMAT(display.createdTime,'${getDateFormatString(dateFormat)}')`,
      'createdTime',
    );

    queryBuilder.where('display.sym = :stockId', { stockId });
    if (createdTime) {
      const { min, max } = createdTime;
      if (min) queryBuilder.andWhere('display.createdTime >= :min', { min });
      if (max) queryBuilder.andWhere('display.createdTime < :max', { max });
    }
    queryBuilder.orderBy('createdTime', 'ASC');

    return await queryBuilder.getRawMany<IRealDataDisplayContentSchema>();
  }

  private getTransferCreatedTime(dateFormat: DateFormatEnum, unit: number) {
    switch (dateFormat) {
      case DateFormatEnum.MILLISECOND: {
        return (createdTime: string) => {
          const ms = +createdTime.slice(20, 23);
          const transferMs = (Math.floor(ms / unit) * unit)
            .toString()
            .padStart(3, '0');
          return (
            createdTime.substr(0, 20) + transferMs + createdTime.substr(23)
          );
        };
      }
      case DateFormatEnum.SECOND: {
        return (createdTime: string) => {
          const sec = +createdTime.slice(17, 19);
          const transferMs = (Math.floor(sec / unit) * unit)
            .toString()
            .padStart(2, '0');
          return (
            createdTime.substr(0, 17) + transferMs + createdTime.substr(19)
          );
        };
      }
      case DateFormatEnum.HOUR: {
        return (createdTime: string) => {
          const hour = +createdTime.slice(11, 13);
          const transferMs = (Math.floor(hour / unit) * unit)
            .toString()
            .padStart(2, '0');
          return (
            createdTime.substr(0, 11) + transferMs + createdTime.substr(13)
          );
        };
      }
      case DateFormatEnum.DAY: {
        return (createdTime: string) => {
          const day = +createdTime.slice(8, 10);
          const transferMs = (Math.floor(day / unit) * unit)
            .toString()
            .padStart(2, '0');
          return createdTime.substr(0, 8) + transferMs + createdTime.substr(10);
        };
      }
      default: {
        return (createdTime: string) => {
          const min = +createdTime.slice(14, 16);
          const transferMs = (Math.floor(min / unit) * unit)
            .toString()
            .padStart(2, '0');
          return (
            createdTime.substr(0, 14) + transferMs + createdTime.substr(16)
          );
        };
      }
    }
  }

  private async getGroupDisplayContent(query: IRealDataDisplayContentQuery) {
    const originDisplayContent = await this.getOriginDisplayContent(query);
    const {
      dateFormat = DateFormatEnum.MINUTE,
      sampleMode = SampleModeEnum.FIRST,
      unit = 1,
    } = query;

    let reduceTransferDisplay: Record<
      string,
      IRealDataDisplayContentSchema & { isAverage?: boolean }
    >;

    const transferCreatedTime = this.getTransferCreatedTime(dateFormat, unit);
    switch (sampleMode) {
      case SampleModeEnum.FIRST: {
        reduceTransferDisplay = originDisplayContent.reduce<
          Record<string, IRealDataDisplayContentSchema>
        >((p, display, index) => {
          const createdTime = transferCreatedTime(display.createdTime);
          const transferDisplay = { ...display, createdTime };

          if (!p[createdTime]) p[createdTime] = { ...transferDisplay };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MAX: {
        reduceTransferDisplay = originDisplayContent.reduce<
          Record<string, IRealDataDisplayContentSchema>
        >((p, display) => {
          const createdTime = transferCreatedTime(display.createdTime);
          const transferDisplay = { ...display, createdTime };
          if (!p[createdTime]) p[createdTime] = { ...transferDisplay };
          else if (display.mthpx > p[createdTime].mthpx)
            p[createdTime] = { ...transferDisplay };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MIN: {
        reduceTransferDisplay = originDisplayContent.reduce<
          Record<string, IRealDataDisplayContentSchema>
        >((p, display) => {
          const createdTime = transferCreatedTime(display.createdTime);
          const transferDisplay = { ...display, createdTime };
          if (!p[createdTime]) p[createdTime] = { ...transferDisplay };
          else if (display.mthpx < p[createdTime].mthpx)
            p[createdTime] = { ...transferDisplay };
          return p;
        }, {});
        break;
      }
      default: {
        reduceTransferDisplay = originDisplayContent.reduce<
          Record<
            string,
            IRealDataDisplayContentSchema & { isAverage?: boolean }
          >
        >((p, display) => {
          if (display.mthsz === 0) return p;
          const createdTime = transferCreatedTime(display.createdTime);
          const transferDisplay = { ...display, createdTime };
          if (!p[createdTime]) {
            p[createdTime] = { ...transferDisplay };
            p[createdTime].mthpx = display.mthpx * display.mthsz;
            p[createdTime].isAverage = true;
          } else {
            p[createdTime].mthpx += display.mthpx * display.mthsz;
            p[createdTime].mthsz += display.mthsz;
          }
          return p;
        }, {});
        break;
      }
    }

    return Object.values(reduceTransferDisplay).map(
      ({ isAverage, ...display }) => {
        if (isAverage && display.mthsz !== 0)
          display.mthpx = display.mthpx / display.mthsz;
        return display;
      },
    );
  }

  public async getDisplayContent(query: IRealDataDisplayContentQuery) {
    const groupDisplayContent = await this.getGroupDisplayContent(query);
    const { fields } = query;
    if (!fields)
      return groupDisplayContent.map(
        ({ id, createdTime, ...display }, count) => {
          const displayObj = {
            count,
            trdate: moment(createdTime).format('YYYYMMDD'),
            ts: moment(createdTime).format('HH:mm:ss.SSS'),
            ...display,
          };
          return displayObj;
        },
      );

    const transferFields = fields.filter((field) => {
      return FIELDS.includes(field);
    });
    return groupDisplayContent.map(({ id, createdTime, ...display }, count) => {
      const displayObj = {
        count,
        trdate: moment(createdTime).format('YYYYMMDD'),
        ts: moment(createdTime).format('HH:mm:ss.SSS'),
        ...display,
      };

      const returnObj: any = {};
      transferFields.forEach((field) => {
        returnObj[field] = displayObj[field];
      });
      return returnObj;
    });
  }

  public async getFilePath(query: IRealDataDisplayContentQuery) {
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

    return path;
  }

  public createFile(path: string, displays: any[]) {
    if (!displays.length) {
      fs.writeFileSync(path, FIELDS.join(',\n'));
      return true;
    }
    const fields = Object.keys(displays[0]);
    const headers = fields.join(',');
    fs.writeFileSync(path, headers + '\n');

    displays.forEach((display) => {
      const content = Object.values(display).join(',');
      fs.appendFileSync(path, content + '\n');
    });

    return true;
  }

  public async removeFile(path: string) {
    fs.unlinkSync(path);
    return true;
  }

  public async insertDisplayContent(body: IRealDataDisplayContentInsert) {
    await this.realDataDisplayContentRepository.insert(
      body.map(({ realDataDisplayId, ...v }) => {
        return {
          ...v,
          realDataDisplay: { id: realDataDisplayId },
        };
      }),
    );
    return true;
  }
}
