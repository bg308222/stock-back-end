import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { IResearchObjectResponse, IResearchQuery } from './research.dto';
import { ResearchService } from './research.service';

@Controller('research')
@ApiTags('Research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get()
  @ApiResponse({
    status: 200,
    schema: IResearchObjectResponse,
  })
  public async getResearch(@Query() query: IResearchQuery) {
    if (!query.stockId) throw new BadRequestException('Missing stockId');
    return await this.researchService.getResearch(query);
  }

  @Get('download')
  public async downloadResearch(
    @Query() query: IResearchQuery,
    @Res() res: Response,
  ) {
    if (!query.stockId) throw new BadRequestException('Missing stockId');
    const path = await this.researchService.downloadResearch(query);
    res.download(path, () => {
      this.researchService.removeFile(path);
      res.end();
    });
  }
}
