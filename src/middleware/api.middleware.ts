import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    Object.entries(req.query).forEach(([key, value]) => {
      try {
        req.query[key] = JSON.parse(value as any);
      } catch {}
    });
    console.log('\n-------------');
    console.log('---REQUEST---');
    console.log(`${req.method} ${req.baseUrl}`);
    console.log('Query: ', req.query);
    console.log('Body: ', req.body);
    console.log('-------------\n');
    next();
  }
}
