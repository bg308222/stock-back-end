import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly stockService: TransactionService) {}
}
