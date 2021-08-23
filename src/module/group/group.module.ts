import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/common/entity/group.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
