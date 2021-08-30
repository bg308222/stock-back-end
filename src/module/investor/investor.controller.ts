import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestorService } from './investor.service';
import { IInvestorInsert, IInvestorLogin } from './investor.dto';
import { Investor } from 'src/common/entity/investor.entity';

@ApiTags('Investor')
@Controller('investor')
export class InvestorController {
  constructor(private readonly investService: InvestorService) {}

  @Post()
  public async create(@Body() body: IInvestorInsert) {
    return await this.investService.create(body);
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'string',
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoiYWRtaW4iLCJpYXQiOjE2MzAyODg2NTN9.5zYFSO0NtGFRe0it8y4cWqXOYRvowBatrk93Q8q5tdA',
    },
  })
  public async login(@Body() body: IInvestorLogin) {
    return await this.investService.login(body);
  }

  @Post('logout')
  public async logout(@Query('investor') investor: Investor) {
    return await this.investService.logout(investor);
  }
}
