import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvestorService } from './investor.service';
import {
  IInvestorInsert,
  IInvestorLogin,
  IInvestorQuery,
} from './investor.dto';

@ApiTags('Investor')
@Controller('investor')
export class InvestorController {
  constructor(private readonly investService: InvestorService) {}

  @Post()
  public async create(@Body() body: IInvestorInsert) {
    return await this.investService.create(body);
  }

  @Post('login')
  public async login(@Body() body: IInvestorLogin) {
    return await this.investService.login(body);
  }

  @Post('logout')
  public async logout(@Query() query: IInvestorQuery) {
    return await this.investService.logout(query);
  }
}
