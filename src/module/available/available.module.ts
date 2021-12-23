import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailableFuture } from 'src/common/entity/availableFuture.entity';
import { AvailableFutureDate } from 'src/common/entity/availableFutureDate.entity';
import { AvailableStock } from 'src/common/entity/availableStock.entity';
import { AvailableStockDate } from 'src/common/entity/availableStockDate.entity';
import { RealDataFutureDisplayContent } from 'src/common/entity/realDataFutureDisplayContent.entity';
import { RealDataFutureOrderContent } from 'src/common/entity/realDataFutureOrderContent.entity';
import { RealDataFutureTransactionContent } from 'src/common/entity/realDataFutureTransactionContent.entity';
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
      AvailableFuture,
      AvailableFutureDate,
      RealDataStockDisplayContent,
      RealDataStockOrderContent,
      RealDataStockTransactionContent,
      RealDataFutureDisplayContent,
      RealDataFutureOrderContent,
      RealDataFutureTransactionContent,
    ]),
  ],
  controllers: [AvailableController],
  providers: [AvailableService],
  exports: [AvailableService],
})
export class AvailableModule {}
