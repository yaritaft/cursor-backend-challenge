import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';
import { ClientsModule } from '../clients/clients.module';
import { BreakerFactory } from '../middlewares/breaker.factory';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ClientsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, BreakerFactory],
  exports: [UsersService],
})
export class UsersModule {}
