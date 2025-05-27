import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        // If AppDataSource is not initialized, initialize it
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }

        // Return the options from AppDataSource
        return {
          ...AppDataSource.options,
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
