import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/common/entity/group.entity';
import { Stock } from 'src/common/entity/stock.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  IGroupDelete,
  IGroupInsert,
  IGroupQuery,
  IGroupSchema,
  IGroupUpdate,
  queryStrategy,
} from './group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  public async get({ ...query }: IGroupQuery) {
    const { fullQueryBuilder, totalSize } =
      await getQueryBuilderContent<IGroupSchema>(
        'group',
        this.groupRepository.createQueryBuilder('group'),
        queryStrategy,
        query,
      );
    fullQueryBuilder.leftJoinAndSelect('group.stocks', 'stocks');
    return {
      content: await fullQueryBuilder.getMany(),
      totalSize,
    };
  }

  public async insert({ stockId, ...body }: IGroupInsert) {
    const {
      generatedMaps: [generatedMap],
    } = await this.groupRepository.insert(body);

    if (stockId) {
      await this.update({ id: generatedMap.id, stockId });
    }
    return true;
  }

  public async update({ id, name, stockId }: IGroupUpdate) {
    const group = await this.groupRepository.findOne(id);

    if (name) {
      group.name = name;
    }

    if (stockId) {
      group.stocks = stockId.map((id) => {
        const stock = new Stock();
        stock.id = id;
        return stock;
      });
    }

    await this.groupRepository.save(group);
    return true;
  }

  public async delete(body: IGroupDelete) {
    await this.groupRepository.delete(body.id);
    return true;
  }
}
