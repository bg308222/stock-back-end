import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Investor } from 'src/common/entity/investor.entity';
import { RbacService } from 'src/module/rbac/rbac.service';

@Injectable()
export class RbacMiddleware implements NestMiddleware {
  constructor(private readonly rbacService: RbacService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const investor = req.query.investor as any as Investor;
    if (!investor && req.baseUrl === '/api/investor/login') next();
    else {
      const role = await this.rbacService.getRole({ id: investor.roleId });
      const permissions = role && role.content && role.content[0].permissions;
      // console.log(investor, role);
      next();
    }
  }
}
