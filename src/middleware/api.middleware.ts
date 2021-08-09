import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const checkRequest = (req, isCheck = true) => {
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
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    Object.entries(req.query).forEach(([key, value]) => {
      try {
        req.query[key] = JSON.parse(value as any);
      } catch {}
    });

    checkRequest(req, !req.baseUrl.includes('display'));

    next();
  }
}
