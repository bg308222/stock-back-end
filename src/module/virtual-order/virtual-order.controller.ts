import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IDisplayObjectResponse } from '../display/display.dto';
import { MatchService } from '../match/match.service';
import { IOrderQueryResponse } from '../order/order.dto';
import { VirtualOrderService } from './virtual-order.service';
import {
  IVirtualOrderContainerInsert,
  IVirtualOrderContainerQuery,
  IVirtualOrderContainerQueryResponse,
  IVirtualOrderInsert,
  IVirtualOrderQuery,
} from './virtualOrder.dto';

@ApiTags('VirtualOrder')
@Controller('virtualOrder')
export class VirtualOrderController {
  constructor(
    private readonly virtualOrderService: VirtualOrderService,
    private readonly matchService: MatchService,
  ) {}

  private getMarketName(virtualOrderContainerId: number) {
    return `VIRTUAL_${virtualOrderContainerId}`;
  }

  @Get()
  @ApiOperation({
    summary: '獲取該情境下的所有委託',
  })
  @ApiResponse({
    type: IOrderQueryResponse,
  })
  public async getVirtualOrder(@Query() query: IVirtualOrderQuery) {
    if (!query.virtualOrderContainerId)
      throw new BadRequestException('Missing virtualOrderContainerId');
    return await this.virtualOrderService.getVirtualOrder(query);
  }

  @Get('container')
  @ApiOperation({
    summary: '獲取所有情境',
  })
  @ApiResponse({
    status: 200,
    type: IVirtualOrderContainerQueryResponse,
  })
  public async getContainer(@Query() query: IVirtualOrderContainerQuery) {
    return await this.virtualOrderService.getContainer(query);
  }

  @Get('container/:virtualOrderContainerId')
  @ApiOperation({
    summary: '獲取該情境的display資訊',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        virtualOrderContainerId: {
          type: 'number',
          example: 1,
        },
        display: IDisplayObjectResponse,
      },
    },
  })
  public async getContainerDetail(
    @Param('virtualOrderContainerId') virtualOrderContainerId: number,
  ) {
    if (!virtualOrderContainerId)
      throw new BadRequestException('Missing virtualOrderContainerId');
    const marketName = this.getMarketName(virtualOrderContainerId);
    const container = await this.virtualOrderService.getContainerDetail(
      virtualOrderContainerId,
    );
    if (!container) {
      throw new BadRequestException("Container doesn't exist");
    }
    const marketBook = container.marketBook
      ? JSON.parse(container.marketBook)
      : undefined;
    await this.matchService.setMarketBook(
      container.stockId,
      marketBook,
      marketName,
    );
    return {
      virtualOrderContainerId,
      display: await this.matchService.getDisplayReturnType(marketName),
    };
  }

  @ApiOperation({
    summary: '新建一個情境',
    description:
      '會回傳情境的id，之後call POST /api/virtualOrder時，帶著這個id',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        virtualOrderContainerId: {
          type: 'number',
          example: 1,
        },
        display: IDisplayObjectResponse,
      },
    },
  })
  @Post('container')
  public async insertContainer(@Body() body: IVirtualOrderContainerInsert) {
    const virtualOrderContainerId =
      await this.virtualOrderService.insertContainer(body);
    const marketName = this.getMarketName(virtualOrderContainerId);
    await this.matchService.createMarket(body.stockId, marketName);
    await this.matchService.setMarketBook(body.stockId, undefined, marketName);
    return {
      virtualOrderContainerId,
      display: await this.matchService.getDisplayReturnType(marketName),
    };
  }

  @ApiOperation({
    summary: '新增情境的委託單',
    description: 'virtualOrderContainerId的值為創建情境時的id',
  })
  @ApiResponse({
    status: 200,
    schema: IDisplayObjectResponse,
  })
  @Post()
  public async insertOrder(@Body() body: IVirtualOrderInsert) {
    const marketName = this.getMarketName(body.virtualOrderContainerId);
    await this.virtualOrderService.insertOrder(body);
    const display = await this.matchService.dispatchOrder(
      {
        ...body,
        investorId: 0,
      },
      marketName,
    );
    const marketBook = this.matchService.getMarketBook(marketName);
    await this.virtualOrderService.updateContainer({
      id: body.virtualOrderContainerId,
      marketBook,
    });
    return display;
  }

  @Put('container/:virtualOrderContainerId')
  @ApiOperation({
    summary: '重置該情境，並回傳display資訊',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        virtualOrderContainerId: {
          type: 'number',
          example: 1,
        },
        display: IDisplayObjectResponse,
      },
    },
  })
  public async resetContainer(
    @Param('virtualOrderContainerId') virtualOrderContainerId: number,
  ) {
    if (!virtualOrderContainerId)
      throw new BadRequestException('Missing virtualOrderContainerId');
    const marketName = this.getMarketName(virtualOrderContainerId);
    const container = await this.virtualOrderService.resetContainer(
      virtualOrderContainerId,
    );

    await this.matchService.setMarketBook(
      container.stockId,
      undefined,
      marketName,
    );
    return {
      virtualOrderContainerId,
      display: await this.matchService.getDisplayReturnType(marketName),
    };
  }

  @Delete('container/:virtualOrderContainerId')
  @ApiOperation({
    summary: '刪除該情境',
  })
  public async deleteContainer(
    @Param('virtualOrderContainerId') virtualOrderContainerId: number,
  ) {
    return await this.virtualOrderService.deleteContainer(
      virtualOrderContainerId,
    );
  }
}
