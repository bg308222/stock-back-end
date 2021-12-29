import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IAvailableQuery } from './available.dto';
import { AvailableService } from './available.service';

@ApiSecurity('login')
@ApiTags('Available')
@Controller('available')
export class AvailableController {
  constructor(private readonly availableService: AvailableService) {}

  @Get('stock')
  public async getAvailableStock(@Query() { type }: IAvailableQuery) {
    if (!type) throw new BadRequestException('Type is required');
    const result = await this.availableService.getAvailableStock(type);
    return result;
  }

  @Get('stock/:id')
  public async getAvailableStockDate(
    @Param('id') id: string,
    @Query() { type }: IAvailableQuery,
  ) {
    if (!type) throw new BadRequestException('Type is required');
    const result = await this.availableService.getAvailableStockDate(id, type);
    return result;
  }

  @Get('futures')
  public async getAvailableFutures(@Query() { type }: IAvailableQuery) {
    if (!type) throw new BadRequestException('Type is required');
    const result = await this.availableService.getAvailableFutures(type);
    return result;
  }

  @Get('futures/:id')
  public async getAvailableFuturesDate(
    @Param('id') id: string,
    @Query() { type }: IAvailableQuery,
  ) {
    if (!type) throw new BadRequestException('Type is required');
    const result = await this.availableService.getAvailableFuturesDate(
      id,
      type,
    );
    return result;
  }
}
