import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealDataDisplay } from 'src/common/entity/realDataDisplay.entity';
import { RealDataDisplayContent } from 'src/common/entity/realDataDisplayContent.entity';
import { RealDataOrder } from 'src/common/entity/realDataOrder.entity';
import { RealDataOrderContent } from 'src/common/entity/realDataOrderContent.entity';
import { RealDataTransaction } from 'src/common/entity/realDataTransaction.entity';
import { RealDataTransactionContent } from 'src/common/entity/realDataTransactionContent.entity';
import { AvailableModule } from '../available/available.module';
import { InvestorModule } from '../investor/investor.module';
import { RealDataController } from './real-data.controller';
import { RealDataService } from './real-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RealDataOrder,
      RealDataOrderContent,
      RealDataDisplay,
      RealDataDisplayContent,
      RealDataTransaction,
      RealDataTransactionContent,
    ]),
    InvestorModule,
    AvailableModule,
  ],
  controllers: [RealDataController],
  providers: [RealDataService],
})
export class RealDataModule {}
