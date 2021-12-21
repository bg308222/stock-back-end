import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InvestorService } from 'src/module/investor/investor.service';

const checkRequest = (req: Request, isCheck = true) => {
  if (isCheck) {
    console.log('\n-------------');
    console.log('---REQUEST---');
    console.log(new Date().toLocaleString());
    console.log(`${req.method} ${req.baseUrl}`);
    console.log('Query: ', req.query);
    console.log('Body: ', req.body);
    console.log('Token: ', req.headers.token);
    console.log('-------------\n');
  }
};

const transferDateToISODate = (date: string) => {
  return new Date(new Date(date).getTime() + 8 * 3600000)
    .toISOString()
    .replace('Z', '');
};

const disabledCheckedList = [
  '/api/display',
  '/api/order/realData',
  '/api/display/chart',
  '/api/real-data/display/content',
  '/api/real-data/order/content',
  '/api/real-data/transaction/content',
  '/api/real-data/display/download',
];
@Injectable()
export class ApiMiddleware implements NestMiddleware {
  constructor(private readonly investorService: InvestorService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // Data preprocess
    Object.entries(req.query).forEach(([key, value]) => {
      try {
        req.query[key] = JSON.parse(value as any);
      } catch {}
      if (key === 'stockId') {
        req.query[key] = value.toString();
        return;
      }
      if (['createdTime', 'updatedTime', 'expiredTime'].includes(key)) {
        const value = req.query[key] as any;
        if (typeof value === 'string') {
          req.query[key] = transferDateToISODate(value);
        } else {
          if (value.max) {
            value.max = transferDateToISODate(value.max);
          }
          if (value.min) {
            value.min = transferDateToISODate(value.min);
          }
        }
      }
    });

    if (req.baseUrl === '/api/stock/reset' && req.method === 'PUT') {
      const { startTime, replayTime, endTime } = req.body;
      if (endTime && replayTime && !(new Date(endTime) > new Date(replayTime)))
        throw new BadRequestException('endTime must greater than replayTime');

      if (endTime && startTime && !(new Date(endTime) > new Date(startTime)))
        throw new BadRequestException('endTime must greater than startTime');

      if (
        replayTime &&
        startTime &&
        !(new Date(replayTime) > new Date(startTime))
      )
        throw new BadRequestException('replayTime must greater than startTime');

      if (req.body.startTime)
        req.body.startTime = transferDateToISODate(req.body.startTime);
      if (req.body.replayTime)
        req.body.replayTime = transferDateToISODate(req.body.replayTime);
      if (req.body.endTime)
        req.body.endTime = transferDateToISODate(req.body.endTime);
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
