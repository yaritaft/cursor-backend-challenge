import { Module } from '@nestjs/common';
import { ClientsProviders } from './providers';

@Module({
  providers: [...ClientsProviders],
  exports: [...ClientsProviders],
})
export class ClientsModule {}
