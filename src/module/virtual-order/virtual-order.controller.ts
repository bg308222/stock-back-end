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
import { OrderStatusEnum } from 'src/common/enum';
import { IDisplayObjectResponse } from '../display/display.dto';
import { MatchService } from '../match/match.service';
import { VirtualOrderService } from './virtual-order.service';
import {
  IVirtualOrderContainerInsert,
  IVirtualOrderContainerQuery,
  IVirtualOrderContainerQueryResponse,
  IVirtualOrderInsert,
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

  @Get('container')
  @ApiOperation({
    summary: '獲取所有委託容器',
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
    summary: '獲取該容器的display資訊',
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
      display: this.matchService.getDisplayReturnType(marketName),
    };
  }

  @ApiOperation({
    summary: '新建一個委託容器',
    description:
      '會回傳容器的id，之後call POST /api/virtualOrder時，帶著這個id',
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
    return {
      virtualOrderContainerId,
      display: this.matchService.getDisplayReturnType(marketName),
    };
  }

  @ApiOperation({
    summary: '新增委託腳本內的委託單',
    description: 'virtualOrderContainerId的值為創建容器時的id',
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
    summary: '重置該容器，並回傳display資訊',
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
      display: this.matchService.getDisplayReturnType(marketName),
    };
  }

  @Delete('container/:virtualOrderContainerId')
  @ApiOperation({
    summary: '刪除該容器',
  })
  public async deleteContainer(
    @Param('virtualOrderContainerId') virtualOrderContainerId: number,
  ) {
    return await this.virtualOrderService.deleteContainer(
      virtualOrderContainerId,
    );
  }
}
