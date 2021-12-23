import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RealDataStockDisplay } from 'src/common/entity/realDataStockDisplay.entity';
import { RealDataStockDisplayContent } from 'src/common/entity/realDataStockDisplayContent.entity';
import { RealDataStockOrder } from 'src/common/entity/realDataStockOrder.entity';
import { RealDataStockOrderContent } from 'src/common/entity/realDataStockOrderContent.entity';
import { DateFormatEnum, SampleModeEnum } from 'src/common/enum';
import {
  getDateFormatString,
  getQueryBuilderContent,
} from 'src/common/helper/database.helper';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  IRealDataStockContentQuery,
  IRealDataDisplayContentSchema,
  IRealDataOrderContentQuery,
  IRealDataOrderContentSchema,
  IRealDataQuery,
  IRealDataTransactionContentSchema,
  realDataOrderContentQueryStrategy,
  realDataQueryStrategy,
} from './real-data-dto';
import * as moment from 'moment';
import { RealDataStockTransaction } from 'src/common/entity/realDataStockTransaction.entity';
import { RealDataStockTransactionContent } from 'src/common/entity/realDataStockTransactionContent.entity';
import {
  ORDER_SELECT,
  ORDER_FIELDS,
  TRANSACTION_SELECT,
  TRANSACTION_FIELDS,
  DISPLAY_SELECT,
  DISPLAY_FIELDS,
} from './constant';
import { IRange } from 'src/common/type';
import { AvailableService } from '../available/available.service';
import { RealDataFutureOrder } from 'src/common/entity/realDataFutureOrder.entity';
import { RealDataFutureDisplay } from 'src/common/entity/realDataFutureDisplay.entity';
import { RealDataFutureDisplayContent } from 'src/common/entity/realDataFutureDisplayContent.entity';
import { RealDataFutureOrderContent } from 'src/common/entity/realDataFutureOrderContent.entity';
import { RealDataFutureTransaction } from 'src/common/entity/realDataFutureTransaction.entity';
import { RealDataFutureTransactionContent } from 'src/common/entity/realDataFutureTransactionContent.entity';

export type IFileType = 'order' | 'transaction' | 'display';
export type IMarketType = 'stock' | 'future';
@Injectable()
export class RealDataService {
  constructor(
    @InjectRepository(RealDataStockOrder)
    private readonly realDataOrderRepository: Repository<RealDataStockOrder>,
    @InjectRepository(RealDataStockOrderContent)
    private readonly realDataOrderContentRepository: Repository<RealDataStockOrderContent>,
    @InjectRepository(RealDataStockDisplay)
    private readonly realDataDisplayRepository: Repository<RealDataStockDisplay>,
    @InjectRepository(RealDataStockDisplayContent)
    private readonly realDataDisplayContentRepository: Repository<RealDataStockDisplayContent>,
    @InjectRepository(RealDataStockTransaction)
    private readonly realDataTransactionRepository: Repository<RealDataStockTransaction>,
    @InjectRepository(RealDataStockTransactionContent)
    private readonly realDataTransactionContentRepository: Repository<RealDataStockTransactionContent>,

    @InjectRepository(RealDataFutureOrder)
    private readonly realDataFutureOrderRepository: Repository<RealDataFutureOrder>,
    @InjectRepository(RealDataFutureOrderContent)
    private readonly realDataFutureOrderContentRepository: Repository<RealDataFutureOrderContent>,
    @InjectRepository(RealDataFutureDisplay)
    private readonly realDataFutureDisplayRepository: Repository<RealDataFutureDisplay>,
    @InjectRepository(RealDataFutureDisplayContent)
    private readonly realDataFutureDisplayContentRepository: Repository<RealDataFutureDisplayContent>,
    @InjectRepository(RealDataFutureTransaction)
    private readonly realDataFutureTransactionRepository: Repository<RealDataFutureTransaction>,
    @InjectRepository(RealDataFutureTransactionContent)
    private readonly realDataFutureTransactionContentRepository: Repository<RealDataFutureTransactionContent>,

    private readonly availableService: AvailableService,
  ) {}

  private checkCreatedTimeFormat(
    createdTime: IRange<string>,
    queryBuilder?: SelectQueryBuilder<any>,
    alias?: string,
  ) {
    if (createdTime) {
      const { min, max } = createdTime;
      if (min) {
        if (queryBuilder && alias)
          queryBuilder.andWhere(`${alias}.createdTime >= :min`, { min });
      } else throw new BadRequestException('startTime is required');
      if (max) {
        if (queryBuilder && alias)
          queryBuilder.andWhere(`${alias}.createdTime < :max`, { max });
      } else throw new BadRequestException('endTime is required');

      const diff = new Date(max).getTime() - new Date(min).getTime();
      if (diff > 86400000 * 5) {
        throw new BadRequestException('range is more than 5 days');
      }
    } else {
      throw new BadRequestException('createdTime is required');
    }

    if (queryBuilder && alias) {
      queryBuilder.orderBy(`${alias}.createdTime`, 'ASC');
    }
  }

  private getTransferCreatedTime(dateFormat: DateFormatEnum, unit: number) {
    switch (dateFormat) {
      case DateFormatEnum.MILLISECOND: {
        return (createdTime: string) => {
          const ms = +createdTime.slice(20, 23);
          const transferMs = (Math.floor(ms / unit) * unit)
            .toString()
            .padStart(3, '0');
          return createdTime.slice(0, 20) + transferMs + createdTime.slice(23);
        };
      }
      case DateFormatEnum.SECOND: {
        return (createdTime: string) => {
          const sec = +createdTime.slice(17, 19);
          const transferMs = (Math.floor(sec / unit) * unit)
            .toString()
            .padStart(2, '0');
          return createdTime.slice(0, 17) + transferMs + createdTime.slice(19);
        };
      }
      case DateFormatEnum.HOUR: {
        return (createdTime: string) => {
          const hour = +createdTime.slice(11, 13);
          const transferMs = (Math.floor(hour / unit) * unit)
            .toString()
            .padStart(2, '0');
          return createdTime.slice(0, 11) + transferMs + createdTime.slice(13);
        };
      }
      case DateFormatEnum.DAY: {
        return (createdTime: string) => {
          const day = +createdTime.slice(8, 10);
          const transferMs = (Math.floor(day / unit) * unit)
            .toString()
            .padStart(2, '0');
          return createdTime.slice(0, 8) + transferMs + createdTime.slice(10);
        };
      }
      default: {
        return (createdTime: string) => {
          const min = +createdTime.slice(14, 16);
          const transferMs = (Math.floor(min / unit) * unit)
            .toString()
            .padStart(2, '0');
          return createdTime.slice(0, 14) + transferMs + createdTime.slice(16);
        };
      }
    }
  }

  private getRealDataRepository(
    fileType: IFileType,
    marketType: IMarketType,
    isContent: boolean,
  ): Repository<any> {
    switch (fileType) {
      case 'display': {
        switch (marketType) {
          case 'future': {
            if (isContent) return this.realDataFutureDisplayContentRepository;
            else return this.realDataFutureDisplayRepository;
          }
          case 'stock': {
            if (isContent) return this.realDataDisplayContentRepository;
            else return this.realDataDisplayRepository;
          }
        }
      }
      case 'order': {
        switch (marketType) {
          case 'future': {
            if (isContent) return this.realDataFutureOrderContentRepository;
            else return this.realDataFutureOrderRepository;
          }
          case 'stock': {
            if (isContent) return this.realDataOrderContentRepository;
            else return this.realDataOrderRepository;
          }
        }
      }
      case 'transaction': {
        switch (marketType) {
          case 'future': {
            if (isContent)
              return this.realDataFutureTransactionContentRepository;
            else return this.realDataFutureTransactionRepository;
          }
          case 'stock': {
            if (isContent) return this.realDataTransactionContentRepository;
            else return this.realDataTransactionRepository;
          }
        }
      }
    }
  }

  private invokeAvailableDate(
    id: string,
    fileType: IFileType,
    marketType: IMarketType,
  ) {
    switch (marketType) {
      case 'future': {
        return this.availableService.checkAvailableFutureDate(id, fileType);
      }
      case 'stock': {
        return this.availableService.checkAvailableStockDate(id, fileType);
      }
    }
  }

  public async getRealData(
    query: IRealDataQuery,
    fileType: IFileType,
    marketType: IMarketType,
  ) {
    const respository = this.getRealDataRepository(fileType, marketType, false);

    query.order = {
      order: 'DESC',
      orderBy: 'id',
    };
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<RealDataStockOrder>(
        'realData',
        respository.createQueryBuilder('realData'),
        realDataQueryStrategy,
        query,
      );

    const content = await fullQueryBuilder.getMany();
    return {
      content,
      totalSize,
    };
  }

  public async insertRealData(
    id: string,
    fileType: IFileType,
    marketType: IMarketType,
  ) {
    const repository = this.getRealDataRepository(fileType, marketType, false);
    const realData: Record<string, any> = {};
    realData.id = id;
    await repository.insert(realData);
    return true;
  }

  public async insertRealDataContent(
    body: any[],
    fileType: IFileType,
    marketType: IMarketType,
  ) {
    const repository = this.getRealDataRepository(fileType, marketType, true);
    await repository.insert(body);
    return true;
  }

  public async deleteRealData(
    id: string[],
    fileType: IFileType,
    marketType: IMarketType,
  ) {
    const repository = this.getRealDataRepository(fileType, marketType, false);
    if (id && id.length) {
      await repository.delete(id);
      return true;
    }
    throw new BadRequestException('Missing id');
  }

  public async toggleRealDataStatus(
    id: string,
    fileType: IFileType,
    marketType: IMarketType,
  ) {
    const repository = this.getRealDataRepository(fileType, marketType, false);
    const realData = await repository.findOne(id);
    if (!realData) throw new BadRequestException("Id doesn't exist");

    realData.isFinished = 1;
    await repository.save(realData);
    this.invokeAvailableDate(id, fileType, marketType);
    return true;
  }

  private async getOriginOrderContent(
    { stockId, startTime, endTime, dateFormat }: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    if (!stockId) throw new BadRequestException('Missing stockId');

    const repository = this.getRealDataRepository('order', marketType, true);
    const queryBuilder = repository.createQueryBuilder('order');

    queryBuilder.select('order.id', 'id');
    ORDER_SELECT.forEach((select) => {
      queryBuilder.addSelect(`order.${select}`, select);
    });
    queryBuilder.addSelect(
      `DATE_FORMAT(order.createdTime,'${getDateFormatString(dateFormat)}')`,
      'createdTime',
    );

    queryBuilder.where('order.stockId = :stockId', { stockId });
    this.checkCreatedTimeFormat(
      { min: startTime, max: endTime },
      queryBuilder,
      'order',
    );

    return await queryBuilder.getRawMany<IRealDataOrderContentSchema>();
  }

  private async getGroupOrderContent(
    query: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    const originOrderContent = await this.getOriginOrderContent(
      query,
      marketType,
    );
    const { dateFormat, sampleMode = SampleModeEnum.FIRST, unit = 1 } = query;
    if (!dateFormat === undefined) return originOrderContent;

    let reduceTransferOrder: Record<
      string,
      IRealDataOrderContentSchema & { isAverage?: boolean }
    >;

    const transferCreatedTime = this.getTransferCreatedTime(dateFormat, unit);
    switch (sampleMode) {
      case SampleModeEnum.FIRST: {
        reduceTransferOrder = originOrderContent.reduce<
          Record<string, IRealDataOrderContentSchema>
        >((p, order) => {
          const createdTime = transferCreatedTime(order.createdTime);
          const transferOrder = { ...order, createdTime };

          if (!p[createdTime]) p[createdTime] = { ...transferOrder };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MAX: {
        reduceTransferOrder = originOrderContent.reduce<
          Record<string, IRealDataOrderContentSchema>
        >((p, order) => {
          const createdTime = transferCreatedTime(order.createdTime);
          const transferOrder = { ...order, createdTime };
          if (!p[createdTime]) p[createdTime] = { ...transferOrder };
          else if (order.price > p[createdTime].price)
            p[createdTime] = { ...transferOrder };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MIN: {
        reduceTransferOrder = originOrderContent.reduce<
          Record<string, IRealDataOrderContentSchema>
        >((p, order) => {
          const createdTime = transferCreatedTime(order.createdTime);
          const transferOrder = { ...order, createdTime };
          if (!p[createdTime]) p[createdTime] = { ...transferOrder };
          else if (order.price < p[createdTime].price)
            p[createdTime] = { ...transferOrder };
          return p;
        }, {});
        break;
      }
      default: {
        reduceTransferOrder = originOrderContent.reduce<
          Record<string, IRealDataOrderContentSchema & { isAverage?: boolean }>
        >((p, order) => {
          if (order.quantity === 0) return p;
          const createdTime = transferCreatedTime(order.createdTime);
          const transferOrder = { ...order, createdTime };
          if (!p[createdTime]) {
            p[createdTime] = { ...transferOrder };
            p[createdTime].price = order.price * order.quantity;
            p[createdTime].isAverage = true;
          } else {
            p[createdTime].price += order.price * order.quantity;
            p[createdTime].quantity += order.quantity;
          }
          return p;
        }, {});
        break;
      }
    }

    return Object.values(reduceTransferOrder).map(({ isAverage, ...order }) => {
      if (isAverage && order.quantity !== 0)
        order.price = order.price / order.quantity;
      return order;
    });
  }

  public async getOrderContent(
    query: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    const groupOrderContent = await this.getGroupOrderContent(
      query,
      marketType,
    );
    const { fields } = query;
    if (!fields)
      return groupOrderContent.map(({ id, createdTime, ...order }, count) => {
        const orderObj = {
          count,
          trdate: moment(createdTime).format('YYYYMMDD'),
          ts: moment(createdTime).format('HH:mm:ss.SSS'),
          ...order,
        };
        return orderObj;
      });

    const transferFields = fields.filter((field) => {
      return ORDER_FIELDS.includes(field);
    });
    return groupOrderContent.map(({ id, createdTime, ...order }, count) => {
      const orderObj = {
        count,
        trdate: moment(createdTime).format('YYYYMMDD'),
        ts: moment(createdTime).format('HH:mm:ss.SSS'),
        ...order,
      };

      const returnObj: any = {};
      transferFields.forEach((field) => {
        returnObj[field] = orderObj[field];
      });
      return returnObj;
    });
  }

  public async getSimulatedOrderContent(
    query: IRealDataOrderContentQuery,
    marketType: IMarketType,
  ) {
    this.checkCreatedTimeFormat(query.createdTime);
    const repository = this.getRealDataRepository('order', marketType, true);
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<RealDataStockOrderContent>(
        'realDataOrderContent',
        repository.createQueryBuilder('realDataOrderContent'),
        realDataOrderContentQueryStrategy,
        query,
      );

    const content = await fullQueryBuilder.getMany();
    return {
      content,
      totalSize,
    };
  }

  private async getOriginTransactionContent(
    { stockId, startTime, endTime, dateFormat }: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    if (!stockId) throw new BadRequestException('Missing stockId');

    const repository = this.getRealDataRepository(
      'transaction',
      marketType,
      true,
    );
    const queryBuilder = repository.createQueryBuilder('transaction');

    queryBuilder.select('transaction.id', 'id');
    TRANSACTION_SELECT.forEach((select) => {
      queryBuilder.addSelect(`transaction.${select}`, select);
    });
    queryBuilder.addSelect(
      `DATE_FORMAT(transaction.createdTime,'${getDateFormatString(
        dateFormat,
      )}')`,
      'createdTime',
    );

    queryBuilder.where('transaction.stockId = :stockId', { stockId });
    this.checkCreatedTimeFormat(
      { min: startTime, max: endTime },
      queryBuilder,
      'transaction',
    );
    return await queryBuilder.getRawMany<IRealDataTransactionContentSchema>();
  }

  private async getGroupTransactionContent(
    query: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    const originTransactionContent = await this.getOriginTransactionContent(
      query,
      marketType,
    );
    const { dateFormat, sampleMode = SampleModeEnum.FIRST, unit = 1 } = query;
    if (!dateFormat === undefined) return originTransactionContent;

    let reduceTransferTransaction: Record<
      string,
      IRealDataTransactionContentSchema & { isAverage?: boolean }
    >;

    const transferCreatedTime = this.getTransferCreatedTime(dateFormat, unit);
    switch (sampleMode) {
      case SampleModeEnum.FIRST: {
        reduceTransferTransaction = originTransactionContent.reduce<
          Record<string, IRealDataTransactionContentSchema>
        >((p, transaction) => {
          const createdTime = transferCreatedTime(transaction.createdTime);
          const transferTransaction = { ...transaction, createdTime };

          if (!p[createdTime]) p[createdTime] = { ...transferTransaction };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MAX: {
        reduceTransferTransaction = originTransactionContent.reduce<
          Record<string, IRealDataTransactionContentSchema>
        >((p, transaction) => {
          const createdTime = transferCreatedTime(transaction.createdTime);
          const transferTransaction = { ...transaction, createdTime };
          if (!p[createdTime]) p[createdTime] = { ...transferTransaction };
          else if (transaction.price > p[createdTime].price)
            p[createdTime] = { ...transferTransaction };
          return p;
        }, {});
        break;
      }
      case SampleModeEnum.MIN: {
        reduceTransferTransaction = originTransactionContent.reduce<
          Record<string, IRealDataTransactionContentSchema>
        >((p, transaction) => {
          const createdTime = transferCreatedTime(transaction.createdTime);
          const transferTransaction = { ...transaction, createdTime };
          if (!p[createdTime]) p[createdTime] = { ...transferTransaction };
          else if (transaction.price < p[createdTime].price)
            p[createdTime] = { ...transferTransaction };
          return p;
        }, {});
        break;
      }
      default: {
        reduceTransferTransaction = originTransactionContent.reduce<
          Record<
            string,
            IRealDataTransactionContentSchema & { isAverage?: boolean }
          >
        >((p, transaction) => {
          if (transaction.quantity === 0) return p;
          const createdTime = transferCreatedTime(transaction.createdTime);
          const transferTransaction = { ...transaction, createdTime };
          if (!p[createdTime]) {
            p[createdTime] = { ...transferTransaction };
            p[createdTime].price = transaction.price * transaction.quantity;
            p[createdTime].isAverage = true;
          } else {
            p[createdTime].price += transaction.price * transaction.quantity;
            p[createdTime].quantity += transaction.quantity;
          }
          return p;
        }, {});
        break;
      }
    }

    return Object.values(reduceTransferTransaction).map(
      ({ isAverage, ...transaction }) => {
        if (isAverage && transaction.quantity !== 0)
          transaction.price = transaction.price / transaction.quantity;
        return transaction;
      },
    );
  }

  public async getTransactionContent(
    query: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    const groupTransactionContent = await this.getGroupTransactionContent(
      query,
      marketType,
    );
    const { fields } = query;
    if (!fields)
      return groupTransactionContent.map(
        ({ id, createdTime, ...transaction }, count) => {
          const transactionObj = {
            count,
            trdate: moment(createdTime).format('YYYYMMDD'),
            ts: moment(createdTime).format('HH:mm:ss.SSS'),
            ...transaction,
          };
          return transactionObj;
        },
      );

    const transferFields = fields.filter((field) => {
      return TRANSACTION_FIELDS.includes(field);
    });
    return groupTransactionContent.map(
      ({ id, createdTime, ...transaction }, count) => {
        const transactionObj = {
          count,
          trdate: moment(createdTime).format('YYYYMMDD'),
          ts: moment(createdTime).format('HH:mm:ss.SSS'),
          ...transaction,
        };

        const returnObj: any = {};
        transferFields.forEach((field) => {
          returnObj[field] = transactionObj[field];
        });
        return returnObj;
      },
    );
  }

  private async getOriginDisplayContent(
    { stockId, startTime, endTime, dateFormat }: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    if (!stockId) throw new BadRequestException('Missing stockId');

    const repository = this.getRealDataRepository('display', marketType, true);
    const queryBuilder = repository.createQueryBuilder('display');

    queryBuilder.select('display.id', 'id');
    DISPLAY_SELECT.forEach((select) => {
      queryBuilder.addSelect(`display.${select}`, select);
    });
    queryBuilder.addSelect(
      `DATE_FORMAT(display.createdTime,'${getDateFormatString(dateFormat)}')`,
      'createdTime',
    );

    queryBuilder.where('display.sym = :stockId', { stockId });
    this.checkCreatedTimeFormat(
      { min: startTime, max: endTime },
      queryBuilder,
      'display',
    );

    return await queryBuilder.getRawMany<IRealDataDisplayContentSchema>();
  }

  private async getGroupDisplayContent(
    query: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    const originDisplayContent = await this.getOriginDisplayContent(
      query,
      marketType,
    );
    const { dateFormat, unit = 1 } = query;
    let { sampleMode = SampleModeEnum.FIRST } = query;
    if (!dateFormat === undefined) {
      return originDisplayContent;
    }
    if (
      originDisplayContent[0] &&
      (originDisplayContent[0].mthpx === undefined ||
        originDisplayContent[0].mthpx === null)
    )
      sampleMode = SampleModeEnum.FIRST;

    let reduceTransferDisplay: Record<
      string,
      IRealDataDisplayContentSchema & { isAverage?: boolean }
    >;

    const transferCreatedTime = this.getTransferCreatedTime(dateFormat, unit);
    switch (sampleMode) {
      case SampleModeEnum.FIRST: {
        reduceTransferDisplay = originDisplayContent.reduce<
          Record<string, IRealDataDisplayContentSchema>
        >((p, display) => {
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

  public async getDisplayContent(
    query: IRealDataStockContentQuery,
    marketType: IMarketType,
  ) {
    const groupDisplayContent = await this.getGroupDisplayContent(
      query,
      marketType,
    );
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
      return DISPLAY_FIELDS.includes(field);
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
}
