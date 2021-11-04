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
import { IInvestorInsert, IInvestorLogin } from './investor.dto';
const privateKey = 'STOCK_PRIVATE_KEY';

@Injectable()
export class InvestorService {
  constructor(
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,
  ) {}

  private getExpiredTime() {
    return new Date(new Date().getTime() + 1800000);
  }

  public async getByToken(token: string, isExpired = true) {
    // TODO Enable authentication
    let account;
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      account = (verify(token, privateKey) as { account: string }).account;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const investor = await this.investorRepository.findOne({ account });
    if (!investor) throw new UnauthorizedException('Invalid token');
    if (isExpired && new Date(investor.expiredTime) < new Date())
      throw new UnauthorizedException('Token expired');
    if (this.getExpiredTime() > new Date(investor.expiredTime))
      investor.expiredTime = this.getExpiredTime();
    await this.investorRepository.save(investor);
    return investor;
  }

  public async create(body: IInvestorInsert) {
    const { account, password } = body;
    if (!account || !password)
      throw new BadRequestException('Missing account or password');
    const hash = hashSync(password, 10);
    if (await this.investorRepository.findOne({ account }))
      throw new ForbiddenException('This account has already existed');

    await this.investorRepository.insert({
      account,
      password: hash,
      expiredTime: this.getExpiredTime(),
    });
    return true;
  }

  public async login(body: IInvestorLogin) {
    const { account, password } = body;
    if (!account || !password)
      throw new BadRequestException('Missing account or password');

    const investor = await this.investorRepository.findOne({ account });
    if (!investor) throw new BadRequestException("Investor doesn't exist");
    if (compareSync(password, investor.password)) {
      const token = sign({ account }, privateKey);
      investor.expiredTime = this.getExpiredTime();
      await this.investorRepository.save(investor);
      return token;
    } else {
      throw new ForbiddenException('Password is wrong');
    }
  }

  public async logout(investor: Investor) {
    if (investor) {
      investor.expiredTime = null;
      await this.investorRepository.save(investor);
    }
    return true;
  }
}
