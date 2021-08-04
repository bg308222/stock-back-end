import { Injectable } from '@nestjs/common';
import { MatchService } from './module/match/match.service';

@Injectable()
export class AppService {
  constructor(private readonly matchService: MatchService) {}

  getHello() {
    return 1;
  }
}
