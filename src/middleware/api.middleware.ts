import { Injectable, NestMiddleware } from '@nestjs/common';
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
    console.log('-------------\n');
  }
};

const disabledCheckedList = ['/api/display', '/api/order/realData'];
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly investorService: InvestorService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    Object.entries(req.query).forEach(([key, value]) => {
      try {
        req.query[key] = JSON.parse(value as any);
      } catch {}
    });

    if (disabledCheckedList.includes(req.baseUrl)) {
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
