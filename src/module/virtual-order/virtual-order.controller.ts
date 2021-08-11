import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderStatusEnum } from 'src/common/enum';
import { transferDisplayToReturnType } from '../display/display.service';
import { MatchService } from '../match/match.service';
import { VirtualOrderService } from './virtual-order.service';
import {
  IVirtualOrderContainerInsert,
  IVirtualOrderContainerQuery,
  IVirtualOrderContainerQueryResponse,
  IVirtualOrderDelete,
  IVirtualOrderInsert,
  IVirtuaoOrderInsertAndDeleteResponse,
} from './virtualOrder.dto';

@ApiTags('VirtualOrder')
@Controller('virtualOrder')
export class VirtualOrderController {
  constructor(
    private readonly virtualOrderService: VirtualOrderService,
    private readonly matchService: MatchService,
  ) {}

  @Get('container')
  @ApiResponse({
    status: 200,
    type: IVirtualOrderContainerQueryResponse,
  })
  public async getContainer(@Query() query: IVirtualOrderContainerQuery) {
    return await this.virtualOrderService.getContainer(query);
  }

  @ApiOperation({
    summary: '新建一個委託容器',
    description:
      '會回傳容器的id，之後call POST /api/virtualOrder時，帶著這個id',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'number',
      example: 1,
    },
  })
  @Post('container')
  public async insertContainer(@Body() body: IVirtualOrderContainerInsert) {
    const {
      generatedMaps: [generatedMap],
    } = await this.virtualOrderService.insertContainer(body);
    return generatedMap.id;
  }

  @ApiOperation({
    summary: '新增委託腳本內的委託單',
    description: 'virtualOrderContainerId的值為創建容器時的id',
  })
  @ApiResponse({
    status: 200,
    schema: IVirtuaoOrderInsertAndDeleteResponse,
  })
  @Post()
  public async insertOrder(@Body() body: IVirtualOrderInsert) {
    const id = await this.virtualOrderService.insertOrder(body);
    const { stockId, order } = await this.virtualOrderService.getContainerById(
      body.virtualOrderContainerId,
      id,
    );
    const display = await this.matchService.dispatchOrder(
      {
        ...order,
        stockId,
        investorId: 0,
        status: OrderStatusEnum.SUCCESS,
      },
      {
        id: body.virtualOrderContainerId,
      },
    );
    return transferDisplayToReturnType(display as any);
  }

  @ApiOperation({
    summary: '刪除委託腳本內的委託單',
  })
  @ApiResponse({
    status: 200,
    schema: IVirtuaoOrderInsertAndDeleteResponse,
  })
  @Delete()
  public async deleteOrder(@Body() body: IVirtualOrderDelete) {
    const { virtualOrderContainerId, id } =
      await this.virtualOrderService.deleteOrder(body);
    const { stockId, order } = await this.virtualOrderService.getContainerById(
      virtualOrderContainerId,
      id,
    );
    const display = await this.matchService.dispatchOrder(
      {
        ...order,
        stockId,
        investorId: 0,
        status: OrderStatusEnum.SUCCESS,
      },
      {
        id: virtualOrderContainerId,
      },
    );
    return transferDisplayToReturnType(display as any);
  }
}
