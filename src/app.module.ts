import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { entities } from './common/entity';
import { InvestorModule } from './module/investor/investor.module';
import { StockModule } from './module/stock/stock.module';
import { OrderModule } from './module/order/order.module';
import { TransactionModule } from './module/transaction/transaction.module';
import { ConfigModule } from '@nestjs/config';
import { ApiMiddleware } from './middleware/api.middleware';
import { MatchModule } from './module/match/match.module';
import { DisplayModule } from './module/display/display.module';
import { VirtualOrderModule } from './module/virtual-order/virtual-order.module';
import { GroupModule } from './module/group/group.module';
import { RealDataModule } from './module/real-data/real-data.module';
import { RbacModule } from './module/rbac/rbac.module';
import { RbacMiddleware } from './middleware/rbac.middleware';
import { AvailableModule } from './module/available/available.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } =
          process.env;
        return {
          type: 'mysql',
          host: DB_HOST,
          port: +DB_PORT,
          username: DB_USERNAME,
          password: DB_PASSWORD,
          database: DB_NAME,
          entities,
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
    InvestorModule,
    StockModule,
    OrderModule,
    TransactionModule,
    ConfigModule,
    MatchModule,
    DisplayModule,
    VirtualOrderModule,
    GroupModule,
    RealDataModule,
    RbacModule,
    AvailableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiMiddleware, RbacMiddleware).forRoutes('*');
  }
}
