import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealDataFutureDisplay } from 'src/common/entity/realDataFutureDisplay.entity';
import { RealDataFutureDisplayContent } from 'src/common/entity/realDataFutureDisplayContent.entity';
import { RealDataFutureOrder } from 'src/common/entity/realDataFutureOrder.entity';
import { RealDataFutureOrderContent } from 'src/common/entity/realDataFutureOrderContent.entity';
import { RealDataFutureTransaction } from 'src/common/entity/realDataFutureTransaction.entity';
import { RealDataFutureTransactionContent } from 'src/common/entity/realDataFutureTransactionContent.entity';
import { RealDataStockDisplay } from 'src/common/entity/realDataStockDisplay.entity';
import { RealDataStockDisplayContent } from 'src/common/entity/realDataStockDisplayContent.entity';
import { RealDataStockOrder } from 'src/common/entity/realDataStockOrder.entity';
import { RealDataStockOrderContent } from 'src/common/entity/realDataStockOrderContent.entity';
import { RealDataStockTransaction } from 'src/common/entity/realDataStockTransaction.entity';
import { RealDataStockTransactionContent } from 'src/common/entity/realDataStockTransactionContent.entity';
import { AvailableModule } from '../available/available.module';
import { InvestorModule } from '../investor/investor.module';
import { RealDataFutureController } from './real-data-future.controller';
import { RealDataStockController } from './real-data-stock.controller';
import { RealDataService } from './real-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RealDataStockOrder,
      RealDataStockOrderContent,
      RealDataStockDisplay,
      RealDataStockDisplayContent,
      RealDataStockTransaction,
      RealDataStockTransactionContent,
      RealDataFutureOrder,
      RealDataFutureOrderContent,
      RealDataFutureDisplay,
      RealDataFutureDisplayContent,
      RealDataFutureTransaction,
      RealDataFutureTransactionContent,
    ]),
    InvestorModule,
    AvailableModule,
  ],
  controllers: [RealDataStockController, RealDataFutureController],
  providers: [RealDataService],
})
export class RealDataModule {}
