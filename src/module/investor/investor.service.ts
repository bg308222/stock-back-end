import {
  BadRequestException,
  ForbiddenException,
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
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'B10715063@gapps.ntust.edu.tw',
    pass: 'Bg36671439',
  },
});

const alpha = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const getAuthenticationKey = () => {
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += alpha[Math.floor(Math.random() * 26)];
  }
  return key;
};

const getOption = (account: string, key: string) => {
  return {
    //寄件者
    // from: '林 子傑<b10715063@gapps.ntust.edu.tw>',
    //收件者
    to: 'bg308222@gmail.com',
    //副本
    //   cc: "account3@gmail.com",
    //密件副本
    //   bcc: "account4@gmail.com",
    //主旨
    subject: 'LOB系統會員認證信', // Subject line
    //純文字
    //嵌入 html 的內文
    html: `<a>http://140.118.118.173:20023/api/investor/authentication/${account}/${key}</a>`,
    //附件檔案
  };
};

const privateKey = 'STOCK_PRIVATE_KEY';
export class InvestorService {
  private mailList: Record<
    string,
    { time: number; investor: Investor | string }
  >;
  constructor(
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    this.mailList = {};
  }

  private checkRestApiTime(investor: Investor) {
    const { role, restApiTime, updatedTime } = investor;
    if (updatedTime.toLocaleDateString() !== new Date().toLocaleDateString()) {
      investor.restApiTime = Math.max(
        (role && role.totalApiTime) || 5,
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
    const { account, password, mail } = body;
    if (!account || !password)
      throw new BadRequestException('Missing account or password');
    const hash = hashSync(password, 10);
    if (await this.investorRepository.findOne({ account }))
      throw new ForbiddenException('This account has already existed');

    const role = new Role();
    role.id = 1;

    const investor = new Investor();
    investor.account = account;
    investor.password = hash;
    investor.expiredTime = this.getExpiredTime();
    investor.role = role;
    investor.mail = mail;

    this.sendMail(investor);
    return true;
  }

  public async sendMail(investor: Investor | string) {
    if (typeof investor === 'string') {
      // investor exist but need to authentication
    } else {
      // create and authenticate investor
      const key = getAuthenticationKey();
      transporter.sendMail(getOption(investor.account, key), (err, info) => {
        if (err) console.log(err);
        else {
          this.mailList[key] = {
            investor,
            time: new Date().getTime() + 600000,
          };
        }
      });
    }
  }

  public async authenticateMail(account: string, key: string) {
    const mail = this.mailList[key];
    if (!mail) throw new ForbiddenException("Authentication key doesn't exist");

    const { investor, time } = mail;
    if (typeof investor === 'string') {
      // investor exist but need to authentication
    } else {
      // create and authenticate investor
      if (investor.account !== account)
        throw new ForbiddenException('This is not your authentication key');
      if (time > new Date().getTime()) {
        await this.investorRepository.insert(investor);
        delete mail[key];
        return true;
      } else
        throw new ForbiddenException(
          'This authentication key has already expired',
        );
    }
    return false;
  }

  public async updateInvestor({
    id,
    account,
    password,
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
    const role = await this.roleRepository.findOne(
      { id: investor.roleId },
      { relations: ['permissions'] },
    );
    if (compareSync(password, investor.password)) {
      const token = sign({ account }, privateKey);
      if (
        !investor.expiredTime ||
        new Date(investor.expiredTime).getTime() <
          this.getExpiredTime().getTime()
      ) {
        investor.expiredTime = this.getExpiredTime();
      }
      investor.token = token;
      await this.investorRepository.save(investor);
      return {
        token,
        permission: role.permissions
          .sort((a, b) => a.order - b.order)
          .map((v) => v.id),
      };
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
