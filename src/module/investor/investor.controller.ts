import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvestorService } from './investor.service';

@ApiTags('Investor')
@Controller('investor')
export class InvestorController {
  constructor(private readonly investService: InvestorService) {}
}
