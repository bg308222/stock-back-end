import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import { getNextTick } from '../match/match.service';
import { IDisplayInsert, IDisplayQuery, queryStrategy } from './display.dto';

@Injectable()
export class DisplayService {
  constructor(
    @InjectRepository(Display)
    private readonly displayRepository: Repository<Display>,
  ) {}

  public async get(query: IDisplayQuery) {
    const { fullQueryBuilder, totalSize } = await getQueryBuilderContent(
      'display',
      this.displayRepository.createQueryBuilder('display'),
      queryStrategy,
      query,
    );
    return {
      content: (await fullQueryBuilder.getMany()).map(
        ({ buyFiveTick, sellFiveTick, tickRange, ...data }) => {
          return {
            ...data,
            buyFiveTick: JSON.parse(buyFiveTick),
            sellFiveTick: JSON.parse(sellFiveTick),
            tickRange: JSON.parse(tickRange),
          };
        },
      ),
      totalSize,
    };
  }

  public async insert(body: IDisplayInsert) {
    return await this.displayRepository.insert({
      ...body,
      stock: { id: body.stockId },
    });
  }
}
