import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailableFutures } from 'src/common/entity/availableFutures.entity';
import { AvailableFuturesDate } from 'src/common/entity/availableFuturesDate.entity';
import { AvailableStock } from 'src/common/entity/availableStock.entity';
import { AvailableStockDate } from 'src/common/entity/availableStockDate.entity';
import { RealDataFuturesDisplayContent } from 'src/common/entity/realDataFuturesDisplayContent.entity';
import { RealDataFuturesOrderContent } from 'src/common/entity/realDataFuturesOrderContent.entity';
import { RealDataFuturesTransactionContent } from 'src/common/entity/realDataFuturesTransactionContent.entity';
import { RealDataStockDisplayContent } from 'src/common/entity/realDataStockDisplayContent.entity';
import { RealDataStockOrderContent } from 'src/common/entity/realDataStockOrderContent.entity';
import { RealDataStockTransactionContent } from 'src/common/entity/realDataStockTransactionContent.entity';
import { AvailableController } from './available.controller';
import { AvailableService } from './available.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvailableStock,
      AvailableStockDate,
      AvailableFutures,
      AvailableFuturesDate,
      RealDataStockDisplayContent,
      RealDataStockOrderContent,
      RealDataStockTransactionContent,
      RealDataFuturesDisplayContent,
      RealDataFuturesOrderContent,
      RealDataFuturesTransactionContent,
    ]),
  ],
  controllers: [AvailableController],
  providers: [AvailableService],
  exports: [AvailableService],
})
export class AvailableModule {}
