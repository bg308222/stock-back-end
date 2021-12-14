import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Investor } from 'src/common/entity/investor.entity';
import { Repository } from 'typeorm';
import { hashSync, compareSync } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import {
  IInvestorDelete,
  IInvestorInsert,
  IInvestorLogin,
  IInvestorQuery,
  IInvestorUpdate,
  queryStrategy,
} from './investor.dto';
import { getQueryBuilderContent } from 'src/common/helper/database.helper';
import { Role } from 'src/common/entity/role.entity';
const privateKey = 'STOCK_PRIVATE_KEY';

@Injectable()
export class InvestorService {
  constructor(
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private checkRestApiTime(investor: Investor) {
    const { role, totalApiTime, restApiTime, updatedTime } = investor;
    if (updatedTime.toLocaleDateString() !== new Date().toLocaleDateString()) {
      investor.restApiTime = Math.max(
        totalApiTime || (role && role.totalApiTime) || 5,
        restApiTime,
      );
    }
  }

  public async subRestApiTime(investor: Investor) {
    this.checkRestApiTime(investor);
    if (investor.restApiTime === 0) {
      throw new ForbiddenException("Today's chance has been used up");
    } else {
      investor.restApiTime -= 1;
      await this.investorRepository.save(investor);
    }
    return true;
  }

  public async getInvestor(query: IInvestorQuery) {
    const { fullQueryBuilder, totalSize } = await getQueryBuilderContent(
      'investor',
      this.investorRepository.createQueryBuilder('investor'),
      queryStrategy,
      query,
    );
    fullQueryBuilder.leftJoinAndSelect('investor.role', 'role');
    const content = (await fullQueryBuilder.getMany()).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password: s1, roleId: s2, ...investor }) => {
        return investor;
      },
    );
    return {
      content,
      totalSize,
    };
  }

  public async createInvestor(body: IInvestorInsert) {
    const { account, password } = body;
    if (!account || !password)
      throw new BadRequestException('Missing account or password');
    const hash = hashSync(password, 10);
    if (await this.investorRepository.findOne({ account }))
      throw new ForbiddenException('This account has already existed');
    const role = new Role();
    role.id = 1;

    await this.investorRepository.insert({
      account,
      password: hash,
      expiredTime: this.getExpiredTime(),
      role,
    });
    return true;
  }

  public async updateInvestor({
    id,
    account,
    password,
    totalApiTime,
    restApiTime,
    roleId,
  }: IInvestorUpdate) {
    if (!id) throw new BadRequestException('Id is required');

    const investor = await this.investorRepository.findOne(
      { id },
      { relations: ['role'] },
    );
    if (!investor) throw new BadRequestException("Investor doesn't exist");

    if (account && account !== investor.account) {
      if (await this.investorRepository.findOne({ account }))
        throw new ForbiddenException('This account has already existed');
      investor.account = account;
    }
    if (password) investor.password = hashSync(password, 10);
    if (totalApiTime) investor.totalApiTime = totalApiTime;
    if (restApiTime) {
      investor.restApiTime = restApiTime;
    } else {
      this.checkRestApiTime(investor);
    }

    if (roleId) {
      const role = await this.roleRepository.findOne({ id: roleId });
      if (!role) throw new BadRequestException("Role doesn't exist");
      investor.role = role;
    }
    await this.investorRepository.save(investor);
    return true;
  }

  public async deleteRole(body: IInvestorDelete) {
    if (body.id.length) {
      await this.investorRepository.delete(body.id);
    }
    return true;
  }

  private getExpiredTime() {
    return new Date(new Date().getTime() + 1800000);
  }

  public async getByToken(token: string, isExpired = true) {
    let account;
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      account = (verify(token, privateKey) as { account: string }).account;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const investor = await this.investorRepository.findOne(
      { account },
      { relations: ['role'] },
    );
    if (!investor) throw new UnauthorizedException('Invalid token');
    if (isExpired && new Date(investor.expiredTime) < new Date())
      throw new UnauthorizedException('Token expired');
    if (this.getExpiredTime() > new Date(investor.expiredTime))
      investor.expiredTime = this.getExpiredTime();
    await this.investorRepository.save(investor);
    return investor;
  }

  public async login(body: IInvestorLogin) {
    const { account, password } = body;
    if (!account || !password)
      throw new BadRequestException('Missing account or password');

    const investor = await this.investorRepository.findOne({ account });
    if (!investor) throw new BadRequestException("Investor doesn't exist");
    if (compareSync(password, investor.password)) {
      const token = sign({ account }, privateKey);
      if (
        !investor.expiredTime ||
        new Date(investor.expiredTime).getTime() <
          this.getExpiredTime().getTime()
      ) {
        investor.expiredTime = this.getExpiredTime();
        await this.investorRepository.save(investor);
      }
      return token;
    } else {
      throw new ForbiddenException('Password is wrong');
    }
  }

  public async logout(investor: Investor) {
    if (
      investor &&
      investor.expiredTime &&
      new Date(investor.expiredTime).getTime() < this.getExpiredTime().getTime()
    ) {
      investor.expiredTime = null;
      await this.investorRepository.save(investor);
    }
    return true;
  }
}
