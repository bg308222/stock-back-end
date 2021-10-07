import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let result = '';
    result += '\n---REQUEST---\n';
    result += new Date().toLocaleString() + '\n';
    result += `${request.method} ${request.baseUrl}\n`;
    result += 'Query: ' + JSON.stringify(request.query) + '\n';
    result += 'Body: ' + JSON.stringify(request.body) + '\n';
    result += status + ' ' + exception.message + '\n';
    result += '-------------\n';
    fs.appendFileSync(__dirname + '/log.txt', result);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
