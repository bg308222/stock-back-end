import { Module } from '@nestjs/common';
import { DisplayModule } from '../display/display.module';
import { FrequentDataController } from './frequent-data.controller';
import { FrequentDataService } from './frequent-data.service';

@Module({
  imports: [DisplayModule],
  controllers: [FrequentDataController],
  providers: [FrequentDataService],
})
export class FrequentDataModule {}
