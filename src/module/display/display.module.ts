import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Display } from 'src/common/entity/display.entity';
import { Stock } from 'src/common/entity/stock.entity';
import { MatchModule } from '../match/match.module';
import { DisplayController } from './display.controller';
import { DisplayService } from './display.service';

@Module({
  imports: [
    forwardRef(() => MatchModule),
    TypeOrmModule.forFeature([Display, Stock]),
  ],
  controllers: [DisplayController],
  providers: [DisplayService],
  exports: [DisplayService],
})
export class DisplayModule {}
