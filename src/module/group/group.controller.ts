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
import {
  IGroupQuery,
  IGroupInsert,
  IGroupUpdate,
  IGroupDelete,
  IGroupQueryResponse,
} from './group.dto';
import { GroupService } from './group.service';

@Controller('group')
@ApiSecurity('login')
@ApiTags('Group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @ApiResponse({ status: 200, type: IGroupQueryResponse })
  public async get(@Query() query: IGroupQuery) {
    query.order = {
      order: 'ASC',
      orderBy: 'group.id',
    };
    return await this.groupService.get(query);
  }

  @Post()
  public async insert(@Body() body: IGroupInsert) {
    return await this.groupService.insert(body);
  }

  @Put()
  public async update(@Body() body: IGroupUpdate) {
    return await this.groupService.update(body);
  }

  @Delete()
  public async delete(@Body() body: IGroupDelete) {
    return await this.groupService.delete(body);
  }
}
