import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/user.entity';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '@nestjs/config';

export interface TestAppContext {
  app: INestApplication;
  dataSource: DataSource;
  usersRepository: Repository<User>;
}

// Test database configuration
const testDbConfig = {
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'usersdb_test',
};

/**
 * Initialize a test application with test database configuration
 */
export async function initTestApp(): Promise<TestAppContext> {
  // Create test module
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // Override ConfigService to use test database configuration
  const configService = moduleFixture.get<ConfigService>(ConfigService);
  jest.spyOn(configService, 'get').mockImplementation((key: string) => {
    switch (key) {
      case 'DATABASE_HOST':
        return testDbConfig.host;
      case 'DATABASE_PORT':
        return testDbConfig.port;
      case 'DATABASE_USER':
        return testDbConfig.username;
      case 'DATABASE_PASSWORD':
        return testDbConfig.password;
      case 'DATABASE_NAME':
        return testDbConfig.database;
      case 'DATABASE_SYNC':
        return true;
      default:
        return configService.get(key);
    }
  });

  // Override database configuration for tests
  const app = moduleFixture.createNestApplication();

  // Get the DataSource before initializing the app
  const dataSource = moduleFixture.get<DataSource>(DataSource);

  // Drop and recreate the database schema
  await dataSource.dropDatabase();
  await dataSource.synchronize();

  // Initialize the app
  await app.init();

  // Get repository
  const usersRepository = moduleFixture.get<Repository<User>>(
    getRepositoryToken(User),
  );

  return {
    app,
    dataSource,
    usersRepository,
  };
}

/**
 * Clean up resources used by the test app
 */
export async function closeTestApp(context: TestAppContext): Promise<void> {
  const { app, dataSource, usersRepository } = context;

  // Clean up test data
  await usersRepository.clear();

  // Close connections
  await dataSource.destroy();
  await app.close();
}

/**
 * Reset the test app state between tests
 */
export async function resetTestApp(context: TestAppContext): Promise<void> {
  const { dataSource, usersRepository } = context;

  // Clear all data
  await usersRepository.clear();

  // Reset the database schema
  await dataSource.synchronize(true);
}
