import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailableFuture } from 'src/common/entity/availableFuture.entity';
import { AvailableFutureDate } from 'src/common/entity/availableFutureDate.entity';
import { AvailableStock } from 'src/common/entity/availableStock.entity';
import { AvailableStockDate } from 'src/common/entity/availableStockDate.entity';
import { RealDataDisplayContent } from 'src/common/entity/realDataDisplayContent.entity';
import { RealDataOrderContent } from 'src/common/entity/realDataOrderContent.entity';
import { RealDataTransactionContent } from 'src/common/entity/realDataTransactionContent.entity';
import { AvailableController } from './available.controller';
import { AvailableService } from './available.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvailableStock,
      AvailableStockDate,
      AvailableFuture,
      AvailableFutureDate,
      RealDataDisplayContent,
      RealDataOrderContent,
      RealDataTransactionContent,
    ]),
  ],
  controllers: [AvailableController],
  providers: [AvailableService],
  exports: [AvailableService],
})
export class AvailableModule {}
