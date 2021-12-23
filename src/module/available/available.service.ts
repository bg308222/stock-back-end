import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailableFuture } from 'src/common/entity/availableFuture.entity';
import { AvailableFutureDate } from 'src/common/entity/availableFutureDate.entity';
import { AvailableStock } from 'src/common/entity/availableStock.entity';
import { AvailableStockDate } from 'src/common/entity/availableStockDate.entity';
import { RealDataFutureDisplayContent } from 'src/common/entity/realDataFutureDisplayContent.entity';
import { RealDataFutureOrderContent } from 'src/common/entity/realDataFutureOrderContent.entity';
import { RealDataFutureTransactionContent } from 'src/common/entity/realDataFutureTransactionContent.entity';
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
    @InjectRepository(AvailableFuture)
    private readonly availableFutureRepository: Repository<AvailableFuture>,
    @InjectRepository(AvailableFutureDate)
    private readonly availableFutureDateRepository: Repository<AvailableFutureDate>,

    @InjectRepository(RealDataStockOrderContent)
    private readonly realDataStockOrderContentRepository: Repository<RealDataStockOrderContent>,
    @InjectRepository(RealDataStockDisplayContent)
    private readonly realDataStockDisplayContentRepository: Repository<RealDataStockDisplayContent>,
    @InjectRepository(RealDataStockTransactionContent)
    private readonly realDataStockTransactionContentRepository: Repository<RealDataStockTransactionContent>,
    @InjectRepository(RealDataFutureOrderContent)
    private readonly realDataFutureOrderContentRepository: Repository<RealDataFutureOrderContent>,
    @InjectRepository(RealDataFutureDisplayContent)
    private readonly realDataFutureDisplayContentRepository: Repository<RealDataFutureDisplayContent>,
    @InjectRepository(RealDataFutureTransactionContent)
    private readonly realDataFutureTransactionContentRepository: Repository<RealDataFutureTransactionContent>,
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

  public async getAvailableFuture(type: string) {
    const result = await this.availableFutureRepository.find({ type });
    return result.map((v) => v.id);
  }
  public async getAvailableFutureDate(id: string, type: string) {
    const queryBuilder =
      this.availableFutureDateRepository.createQueryBuilder('q');
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

  public async checkAvailableFuture(fileType: IFileType) {
    if (fileType === 'order') {
      const originFuture = (
        await this.availableFutureRepository.find({
          type: 'order',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableFutureDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "order"');
      const newFuture = (await queryBuilder.getRawMany<AvailableFuture>()).map(
        (v) => v.id,
      );

      const insertFuture = newFuture
        .filter((v) => {
          return !originFuture.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'order',
          };
        });

      await this.availableFutureRepository.insert(insertFuture);
    } else if (fileType === 'transaction') {
      const originFuture = (
        await this.availableFutureRepository.find({
          type: 'transaction',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableFutureDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "transaction"');
      const newFuture = (await queryBuilder.getRawMany<AvailableFuture>()).map(
        (v) => v.id,
      );

      const insertFuture = newFuture
        .filter((v) => {
          return !originFuture.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'transaction',
          };
        });

      await this.availableFutureRepository.insert(insertFuture);
    } else {
      const originFuture = (
        await this.availableFutureRepository.find({
          type: 'display',
        })
      ).map((v) => v.id);
      const queryBuilder =
        this.availableFutureDateRepository.createQueryBuilder();
      queryBuilder.select('DISTINCT id, type');
      queryBuilder.where('type = "display"');
      const newFuture = (await queryBuilder.getRawMany<AvailableFuture>()).map(
        (v) => v.id,
      );

      const insertFuture = newFuture
        .filter((v) => {
          return !originFuture.includes(v);
        })
        .map((id) => {
          return {
            id,
            type: 'display',
          };
        });

      await this.availableFutureRepository.insert(insertFuture);
    }
  }
  public async checkAvailableFutureDate(fileName: string, fileType: IFileType) {
    if (fileType === 'order') {
      const queryBuilder =
        this.realDataFutureOrderContentRepository.createQueryBuilder('order');
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"order" AS \`type\``,
      );
      queryBuilder.where('realDataOrderId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableFutureDateRepository.insert(insertBody);
    } else if (fileType === 'transaction') {
      const queryBuilder =
        this.realDataFutureTransactionContentRepository.createQueryBuilder(
          'transaction',
        );
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"transaction" AS \`type\``,
      );
      queryBuilder.where('realDataTransactionId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableFutureDateRepository.insert(insertBody);
    } else {
      const queryBuilder =
        this.realDataFutureDisplayContentRepository.createQueryBuilder();
      queryBuilder.select(
        `DISTINCT sym AS id, DATE_FORMAT(createdTime,'%Y-%m-%d') AS \`date\`,"display" AS \`type\``,
      );
      queryBuilder.where('realDataDisplayId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableFutureDateRepository.insert(insertBody);
    }
    this.checkAvailableFuture(fileType);
  }
}
