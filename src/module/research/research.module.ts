import { Module } from '@nestjs/common';
import { DisplayModule } from '../display/display.module';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';

@Module({
  imports: [DisplayModule],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
