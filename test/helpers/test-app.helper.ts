import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../src/users/user.entity';
import { AppModule } from '../../src/app.module';

export interface TestAppContext {
  app: INestApplication;
  dataSource: DataSource;
  usersRepository: Repository<User>;
}

/**
 * Initialize a test application with test database configuration
 */
export async function initTestApp(): Promise<TestAppContext> {
  // Create test module
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

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
  const usersRepository = dataSource.getRepository(User);

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
