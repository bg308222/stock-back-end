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

  @Get('future')
  public async getAvailableFuture(@Query() { type }: IAvailableQuery) {
    if (!type) throw new BadRequestException('Type is required');
    const result = await this.availableService.getAvailableFuture(type);
    return result;
  }

  @Get('future/:id')
  public async getAvailableFutureDate(
    @Param('id') id: string,
    @Query() { type }: IAvailableQuery,
  ) {
    if (!type) throw new BadRequestException('Type is required');
    const result = await this.availableService.getAvailableFutureDate(id, type);
    return result;
  }
}
