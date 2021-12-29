import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealDataFuturesDisplay } from 'src/common/entity/realDataFuturesDisplay.entity';
import { RealDataFuturesDisplayContent } from 'src/common/entity/realDataFuturesDisplayContent.entity';
import { RealDataFuturesOrder } from 'src/common/entity/realDataFuturesOrder.entity';
import { RealDataFuturesOrderContent } from 'src/common/entity/realDataFuturesOrderContent.entity';
import { RealDataFuturesTransaction } from 'src/common/entity/realDataFuturesTransaction.entity';
import { RealDataFuturesTransactionContent } from 'src/common/entity/realDataFuturesTransactionContent.entity';
import { RealDataStockDisplay } from 'src/common/entity/realDataStockDisplay.entity';
import { RealDataStockDisplayContent } from 'src/common/entity/realDataStockDisplayContent.entity';
import { RealDataStockOrder } from 'src/common/entity/realDataStockOrder.entity';
import { RealDataStockOrderContent } from 'src/common/entity/realDataStockOrderContent.entity';
import { RealDataStockTransaction } from 'src/common/entity/realDataStockTransaction.entity';
import { RealDataStockTransactionContent } from 'src/common/entity/realDataStockTransactionContent.entity';
import { AvailableModule } from '../available/available.module';
import { InvestorModule } from '../investor/investor.module';
import { RealDataFuturesController } from './real-data-futures.controller';
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
      RealDataFuturesOrder,
      RealDataFuturesOrderContent,
      RealDataFuturesDisplay,
      RealDataFuturesDisplayContent,
      RealDataFuturesTransaction,
      RealDataFuturesTransactionContent,
    ]),
    InvestorModule,
    AvailableModule,
  ],
  controllers: [RealDataStockController, RealDataFuturesController],
  providers: [RealDataService],
})
export class RealDataModule {}
