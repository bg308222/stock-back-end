import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Investor } from 'src/database/entity/investor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InvestorService {
  constructor(
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,
  ) {}
}
