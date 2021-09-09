import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IRange } from 'src/common/type';
import { InvestorService } from 'src/module/investor/investor.service';

const checkRequest = (req: Request, isCheck = true) => {
  if (isCheck) {
    console.log('\n-------------');
    console.log('---REQUEST---');
    console.log(new Date().toLocaleString());
    console.log(`${req.method} ${req.baseUrl}`);
    console.log('Query: ', req.query);
    console.log('Body: ', req.body);
    console.log('-------------\n');
  }
};

const transferDateToISODate = (date: string) => {
  return new Date(new Date(date).getTime() + 8 * 3600000).toISOString();
};

const disabledCheckedList = [
  '/api/display',
  '/api/order/realData',
  '/api/display/chart',
];
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly investorService: InvestorService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    Object.entries(req.query).forEach(([key, value]) => {
      try {
        req.query[key] = JSON.parse(value as any);
      } catch {}
    });

    if (req.query.createdTime) {
      const { createdTime } = req.query as any as {
        createdTime: IRange<string>;
      };
      if (createdTime.max) {
        createdTime.max = transferDateToISODate(createdTime.max);
      }
      if (createdTime.min) {
        createdTime.min = transferDateToISODate(createdTime.min);
      }
    }

    if (req.body.createdTime && req.method === 'PUT') {
      req.body.createdTime = transferDateToISODate(req.body.createdTime);
    }

    if (!disabledCheckedList.includes(req.baseUrl)) {
      checkRequest(req);
    }

    if (req.baseUrl !== '/api/investor/login') {
      const token = req.headers.token as string;
      const investor = await this.investorService.getByToken(
        token,
        req.baseUrl !== '/api/investor/logout',
      );
      req.query.investor = investor as any;
    }

    next();
  }
}
