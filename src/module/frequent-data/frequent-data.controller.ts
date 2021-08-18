import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  IFrequentDataObjectResponse,
  IFrequentDataQuery,
} from './frequent-data.dto';
import { FrequentDataService } from './frequent-data.service';

@Controller('frequentData')
@ApiTags('FrequentData')
export class FrequentDataController {
  constructor(private readonly frequendDataService: FrequentDataService) {}

  @Get()
  @ApiResponse({
    status: 200,
    schema: IFrequentDataObjectResponse,
  })
  public async getFrequentData(@Query() query: IFrequentDataQuery) {
    if (!query.stockId) throw new BadRequestException('Missing stockId');
    return await this.frequendDataService.getFrequentData(query);
  }

  @Get('download')
  public async downloadFrequentData(
    @Query() query: IFrequentDataQuery,
    @Res() res: Response,
  ) {
    if (!query.stockId) throw new BadRequestException('Missing stockId');
    const path = await this.frequendDataService.downloadFrequentData(query);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.download(path, () => {
      this.frequendDataService.removeFile(path);
      res.end();
    });
  }
}
