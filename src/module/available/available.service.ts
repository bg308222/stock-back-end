import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailableFuture } from 'src/common/entity/availableFuture.entity';
import { AvailableFutureDate } from 'src/common/entity/availableFutureDate.entity';
import { AvailableStock } from 'src/common/entity/availableStock.entity';
import { AvailableStockDate } from 'src/common/entity/availableStockDate.entity';
import { RealDataDisplayContent } from 'src/common/entity/realDataDisplayContent.entity';
import { RealDataOrderContent } from 'src/common/entity/realDataOrderContent.entity';
import { RealDataTransactionContent } from 'src/common/entity/realDataTransactionContent.entity';
import { DateFormatEnum } from 'src/common/enum';
import { getDateFormatString } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';

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

    @InjectRepository(RealDataOrderContent)
    private readonly realDataOrderContentRepository: Repository<RealDataOrderContent>,
    @InjectRepository(RealDataDisplayContent)
    private readonly realDataDisplayContentRepository: Repository<RealDataDisplayContent>,
    @InjectRepository(RealDataTransactionContent)
    private readonly realDataTransactionContentRepository: Repository<RealDataTransactionContent>,
  ) {}

  public async getAvailableStock(type: string) {
    const result = await this.availableStockRepository.find({ type });
    return result.map((v) => v.id);
  }
  public async getAvailableStockDate(id: string, type: string) {
    const result = await this.availableStockDateRepository.find({ id, type });
    return result.map((v) => v.date);
  }

  public async getAvailableFuture(type: string) {
    const result = await this.availableFutureRepository.find({ type });
    return result.map((v) => v.id);
  }
  public async getAvailableFutureDate(id: string, type: string) {
    const result = await this.availableFutureDateRepository.find({ id, type });
    return result.map((v) => v.date);
  }

  public async checkAvailableStock(fileName: string) {
    if (fileName.startsWith('odr')) {
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
    } else if (fileName.startsWith('mth')) {
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

  public async checkAvailableStockDate(fileName: string) {
    if (fileName.startsWith('odr')) {
      const queryBuilder =
        this.realDataOrderContentRepository.createQueryBuilder('order');
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d ') AS \`date\`,"order" AS \`type\``,
      );
      queryBuilder.where('realDataOrderId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableStockDateRepository.insert(insertBody);
    } else if (fileName.startsWith('mth')) {
      const queryBuilder =
        this.realDataTransactionContentRepository.createQueryBuilder(
          'transaction',
        );
      queryBuilder.select(
        `DISTINCT stockId AS id, DATE_FORMAT(createdTime,'%Y-%m-%d ') AS \`date\`,"transaction" AS \`type\``,
      );
      queryBuilder.where('realDataTransactionId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableStockDateRepository.insert(insertBody);
    } else {
      const queryBuilder =
        this.realDataDisplayContentRepository.createQueryBuilder();
      queryBuilder.select(
        `DISTINCT sym AS id, DATE_FORMAT(createdTime,'%Y-%m-%d ') AS \`date\`,"display" AS \`type\``,
      );
      queryBuilder.where('realDataDisplayId = :fileName', { fileName });

      const insertBody = await queryBuilder.getRawMany();
      await this.availableStockDateRepository.insert(insertBody);
    }
    this.checkAvailableStock(fileName);
  }
}
