import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investor } from 'src/common/entity/investor.entity';
import { Role } from 'src/common/entity/role.entity';
import { InvestorController } from './investor.controller';
import { InvestorService } from './investor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Investor, Role]), ConfigModule],
  controllers: [InvestorController],
  providers: [InvestorService],
  exports: [InvestorService],
})
export class InvestorModule {}
