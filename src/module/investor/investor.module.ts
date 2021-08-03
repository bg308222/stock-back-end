import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investor } from 'src/database/entity/investor.entity';
import { InvestorController } from './investor.controller';
import { InvestorService } from './investor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Investor])],
  controllers: [InvestorController],
  providers: [InvestorService],
})
export class InvestorModule {}
