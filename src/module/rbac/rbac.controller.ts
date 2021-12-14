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
  IRoleDelete,
  IRoleInsert,
  IRoleQuery,
  IRoleQueryResponse,
  IRoleUpdate,
} from './rbac.dto';
import { RbacService } from './rbac.service';
@ApiSecurity('login')
@Controller('rbac')
@ApiTags('Rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('role')
  @ApiResponse({ type: IRoleQueryResponse, status: 200 })
  public async getRole(@Query() query: IRoleQuery) {
    return await this.rbacService.getRole(query);
  }

  @Post('role')
  public async createRole(@Body() body: IRoleInsert) {
    await this.rbacService.createRole(body);
    return true;
  }

  @Put('role')
  public async updateRole(@Body() body: IRoleUpdate) {
    await this.rbacService.updateRole(body);
    return true;
  }

  @Delete('role')
  public async deleteRole(@Body() body: IRoleDelete) {
    await this.rbacService.deleteRole(body);
    return true;
  }

  @Get('permission')
  @ApiResponse({ isArray: true, type: 'string' })
  public async getPermission() {
    return await this.rbacService.getPermission();
  }
}
