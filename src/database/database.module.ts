import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from './entity';
import { repositories } from './repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'mariadb',
          host: 'localhost',
          port: 3306,
          database: 'stock-back-end',
          username: 'root',
          password: '12345',
          entities: ['./entity/*.ts'],
          timezone: '+00:00',
          autoLoadEntities: true,
        } as TypeOrmModuleOptions;
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class DatabaseModule {}
