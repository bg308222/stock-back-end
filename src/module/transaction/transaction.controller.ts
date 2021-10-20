import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ITransactionQuery,
  ITransactionQueryResponse,
} from './transaction.dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@ApiSecurity('login')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiResponse({ type: ITransactionQueryResponse, status: 200 })
  @Get()
  public async get(@Query() query: ITransactionQuery) {
    return await this.transactionService.get(query);
  }
}
