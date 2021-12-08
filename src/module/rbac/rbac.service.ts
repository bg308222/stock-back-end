import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/common/entity/permission.entity';
import { Role } from 'src/common/entity/role.entity';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Repository } from 'typeorm';
import {
  IRoleDelete,
  IRoleInsert,
  IRoleQuery,
  IRoleUpdate,
  queryStrategy,
} from './rbac.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  public async getRole(query: IRoleQuery) {
    const { fullQueryBuilder, totalSize } = await getQueryBuilderContent(
      'role',
      this.roleRepository.createQueryBuilder('role'),
      queryStrategy,
      query,
    );
    fullQueryBuilder.leftJoinAndSelect('role.permissions', 'permissions');
    return {
      content: await fullQueryBuilder.getMany(),
      totalSize,
    };
  }

  public async createRole({ name, totalApiTime, permissions }: IRoleInsert) {
    if (!name) throw new BadRequestException('Name is required');
    if (await this.roleRepository.findOne({ name }))
      throw new BadRequestException('Role has already existed');

    const role = new Role();
    role.name = name;
    if (totalApiTime) role.totalApiTime = totalApiTime;
    if (permissions)
      role.permissions = permissions.map((v) => {
        const permission = new Permission();
        permission.id = v;
        return permission;
      });
    await this.roleRepository.save(role);
    return true;
  }

  public async updateRole({
    id,
    name,
    totalApiTime,
    permissions,
  }: IRoleUpdate) {
    if (id === 1) throw new ForbiddenException("Can't update root");
    if (!id) throw new BadRequestException('Id is required');

    const role = await this.roleRepository.findOne({ id });
    if (!role) throw new BadRequestException("Role doesn't exist");

    if (name) role.name = name;
    if (totalApiTime) role.totalApiTime = totalApiTime;
    if (permissions)
      role.permissions = permissions.map((v) => {
        const permission = new Permission();
        permission.id = v;
        return permission;
      });
    await this.roleRepository.save(role);
    return true;
  }

  public async deleteRole({ id: ids }: IRoleDelete) {
    const filterRootId = ids.filter((id) => id !== 1);
    if (filterRootId.length === 0)
      throw new BadRequestException("Can't delete root role");

    await this.roleRepository.delete(filterRootId);
    return true;
  }

  public async getPermission() {
    const routes = await this.permissionRepository.find();
    return routes.map((route) => route.id);
  }
}
