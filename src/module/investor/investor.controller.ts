import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InvestorService } from './investor.service';
import {
  IInvestorDelete,
  IInvestorInsert,
  IInvestorLogin,
  IInvestorQuery,
  IInvestorQueryResponse,
  IInvestorUpdate,
} from './investor.dto';
import { Investor } from 'src/common/entity/investor.entity';

@ApiTags('Investor')
@Controller('investor')
export class InvestorController {
  constructor(private readonly investService: InvestorService) {}

  @ApiSecurity('login')
  @ApiResponse({ type: IInvestorQueryResponse, status: 200 })
  @Get()
  public async getInvestor(@Query() query: IInvestorQuery) {
    return await this.investService.getInvestor(query);
  }

  @ApiSecurity('login')
  @Post()
  public async createInvestor(@Body() body: IInvestorInsert) {
    await this.investService.createInvestor(body);
    return true;
  }

  @ApiSecurity('login')
  @Post('student')
  public async createStudent(@Body() body: IInvestorInsert) {
    await this.investService.createStudent(body);
    return true;
  }

  @ApiSecurity('login')
  @Put()
  public async updateInvestor(@Body() body: IInvestorUpdate) {
    await this.investService.updateInvestor(body);
    return true;
  }

  @ApiSecurity('login')
  @Delete()
  public async deleteRole(@Body() body: IInvestorDelete) {
    await this.investService.deleteRole(body);
    return true;
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
