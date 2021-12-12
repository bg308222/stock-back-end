import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { IRoleDelete, IRoleInsert, IRoleQuery, IRoleUpdate } from './rbac.dto';
import { RbacService } from './rbac.service';

@ApiSecurity('login')
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('role')
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
  public async getPermission() {
    return await this.rbacService.getPermission();
  }
}