import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ITransactionQuery,
  ITransactionQueryResponse,
} from './transaction.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiResponse({ type: ITransactionQueryResponse, status: 200 })
  @ApiOperation({
    summary: '目前好像沒地方要顯示這個',
  })
  @Get()
  public async get(@Query() query: ITransactionQuery) {
    return this.transactionService.get(query);
  }
}
