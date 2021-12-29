import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailableFutures } from 'src/common/entity/availableFutures.entity';
import { AvailableFuturesDate } from 'src/common/entity/availableFuturesDate.entity';
import { AvailableStock } from 'src/common/entity/availableStock.entity';
import { AvailableStockDate } from 'src/common/entity/availableStockDate.entity';
import { RealDataFuturesDisplayContent } from 'src/common/entity/realDataFuturesDisplayContent.entity';
import { RealDataFuturesOrderContent } from 'src/common/entity/realDataFuturesOrderContent.entity';
import { RealDataFuturesTransactionContent } from 'src/common/entity/realDataFuturesTransactionContent.entity';
import { RealDataStockDisplayContent } from 'src/common/entity/realDataStockDisplayContent.entity';
import { RealDataStockOrderContent } from 'src/common/entity/realDataStockOrderContent.entity';
import { RealDataStockTransactionContent } from 'src/common/entity/realDataStockTransactionContent.entity';
import { Repository } from 'typeorm';
import { IFileType } from '../real-data/real-data.service';

@Injectable()
export class AvailableService {
  constructor(
    @InjectRepository(AvailableStock)
    private readonly availableStockRepository: Repository<AvailableStock>,
    @InjectRepository(AvailableStockDate)
    private readonly availableStockDateRepository: Repository<AvailableStockDate>,
    @InjectRepository(AvailableFutures)
    private readonly availableFuturesRepository: Repository<AvailableFutures>,
    @InjectRepository(AvailableFuturesDate)
    private readonly availableFuturesDateRepository: Repository<AvailableFuturesDate>,

    @InjectRepository(RealDataStockOrderContent)
    private readonly realDataStockOrderContentRepository: Repository<RealDataStockOrderContent>,
    @InjectRepository(RealDataStockDisplayContent)
    private readonly realDataStockDisplayContentRepository: Repository<RealDataStockDisplayContent>,
    @InjectRepository(RealDataStockTransactionContent)
    private readonly realDataStockTransactionContentRepository: Repository<RealDataStockTransactionContent>,
    @InjectRepository(RealDataFuturesOrderContent)
    private readonly realDataFuturesOrderContentRepository: Repository<RealDataFuturesOrderContent>,
    @InjectRepository(RealDataFuturesDisplayContent)
    private readonly realDataFuturesDisplayContentRepository: Repository<RealDataFuturesDisplayContent>,
    @InjectRepository(RealDataFuturesTransactionContent)
    private readonly realDataFuturesTransactionContentRepository: Repository<RealDataFuturesTransactionContent>,
  ) {}

  public async getAvailableStock(type: string) {
    const result = await this.availableStockRepository.find({ type });
    return result.map((v) => v.id);
  }
  public async getAvailableStockDate(id: string, type: string) {
    const queryBuilder =
      this.availableStockDateRepository.createQueryBuilder('q');
    queryBuilder.select(`DATE_FORMAT(date,'%Y-%m-%d')`, 'date');
    queryBuilder.where('id = :id', { id });
    queryBuilder.andWhere('type = :type', { type });

    const result = await queryBuilder.getRawMany();
    return result.map((v) => v.date);
  }

  public async getAvailableFutures(type: string) {
    const result = await this.availableFuturesRepository.find({ type });
    return result.map((v) => v.id);
  }
  public async getAvailableFuturesDate(id: string, type: string) {
    const queryBuilder =
      this.availableFuturesDateRepository.createQueryBuilder('q');
    queryBuilder.select(`DATE_FORMAT(date,'%Y-%m-%d')`, 'date');
    queryBuilder.where('id = :id', { id });
    queryBuilder.andWhere('type = :type', { type });

    const result = await queryBuilder.getRawMany();
    return result.map((v) => v.date);
  }

  public async checkAvailableStock(fileType: IFileType) {
    if (fileType === 'order') {
      const originStock = (
        await this.availableStockRepository.find({
          type: 'order',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableStockDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "order"');
      const newStock = (await queryBuilder.getRawMany<AvailableStock>()).map(
        (v) => v.id,
      );

      const insertStock = newStock
        .filter((v) => {
          return !originStock.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'order',
          };
        });

      await this.availableStockRepository.insert(insertStock);
    } else if (fileType === 'transaction') {
      const originStock = (
        await this.availableStockRepository.find({
          type: 'transaction',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableStockDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "transaction"');
      const newStock = (await queryBuilder.getRawMany<AvailableStock>()).map(
        (v) => v.id,
      );

      const insertStock = newStock
        .filter((v) => {
          return !originStock.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'transaction',
          };
        });

      await this.availableStockRepository.insert(insertStock);
    } else {
      const originStock = (
        await this.availableStockRepository.find({
          type: 'display',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableStockDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "display"');
      const newStock = (await queryBuilder.getRawMany<AvailableStock>()).map(
        (v) => v.id,
      );

      const insertStock = newStock
        .filter((v) => {
          return !originStock.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'display',
          };
        });

      await this.availableStockRepository.insert(insertStock);
    }
  }

  public async checkAvailableStockDate(fileName: string, fileType: IFileType) {
    if (fileType === 'order') {
      const queryBuilder =
        this.realDataStockOrderContentRepository.createQueryBuilder('order');
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"order" AS \`type\``,
      );
      queryBuilder.where('realDataOrderId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableStockDateRepository.insert(insertBody);
    } else if (fileType === 'transaction') {
      const queryBuilder =
        this.realDataStockTransactionContentRepository.createQueryBuilder(
          'transaction',
        );
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"transaction" AS \`type\``,
      );
      queryBuilder.where('realDataTransactionId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableStockDateRepository.insert(insertBody);
    } else {
      const queryBuilder =
        this.realDataStockDisplayContentRepository.createQueryBuilder();
      queryBuilder.select(
        `DISTINCT sym AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"display" AS \`type\``,
      );
      queryBuilder.where('realDataDisplayId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableStockDateRepository.insert(insertBody);
    }
    this.checkAvailableStock(fileType);
  }

  public async checkAvailableFutures(fileType: IFileType) {
    if (fileType === 'order') {
      const originFutures = (
        await this.availableFuturesRepository.find({
          type: 'order',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableFuturesDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "order"');
      const newFutures = (
        await queryBuilder.getRawMany<AvailableFutures>()
      ).map((v) => v.id);

      const insertFutures = newFutures
        .filter((v) => {
          return !originFutures.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'order',
          };
        });

      await this.availableFuturesRepository.insert(insertFutures);
    } else if (fileType === 'transaction') {
      const originFutures = (
        await this.availableFuturesRepository.find({
          type: 'transaction',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableFuturesDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "transaction"');
      const newFutures = (
        await queryBuilder.getRawMany<AvailableFutures>()
      ).map((v) => v.id);

      const insertFutures = newFutures
        .filter((v) => {
          return !originFutures.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'transaction',
          };
        });

      await this.availableFuturesRepository.insert(insertFutures);
    } else {
      const originFutures = (
        await this.availableFuturesRepository.find({
          type: 'display',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableFuturesDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "display"');
      const newFutures = (
        await queryBuilder.getRawMany<AvailableFutures>()
      ).map((v) => v.id);

      const insertFutures = newFutures
        .filter((v) => {
          return !originFutures.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'display',
          };
        });

      await this.availableFuturesRepository.insert(insertFutures);
    }
  }
  public async checkAvailableFuturesDate(
    fileName: string,
    fileType: IFileType,
  ) {
    if (fileType === 'order') {
      const queryBuilder =
        this.realDataFuturesOrderContentRepository.createQueryBuilder('order');
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"order" AS \`type\``,
      );
      queryBuilder.where('realDataOrderId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableFuturesDateRepository.insert(insertBody);
    } else if (fileType === 'transaction') {
      const queryBuilder =
        this.realDataFuturesTransactionContentRepository.createQueryBuilder(
          'transaction',
        );
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"transaction" AS \`type\``,
      );
      queryBuilder.where('realDataTransactionId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableFuturesDateRepository.insert(insertBody);
    } else {
      const queryBuilder =
        this.realDataFuturesDisplayContentRepository.createQueryBuilder();
      queryBuilder.select(
        `DISTINCT sym AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"display" AS \`type\``,
      );
      queryBuilder.where('realDataDisplayId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableFuturesDateRepository.insert(insertBody);
    }
    this.checkAvailableFutures(fileType);
  }
}
