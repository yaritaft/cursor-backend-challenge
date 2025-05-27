import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class AddMockUsers1748387144596 implements MigrationInterface {
  // Simple function to hash passwords
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = [
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: this.hashPassword('password123'),
        pokemonIds: '{1, 4, 7}', // PostgreSQL array syntax
      },
      {
        username: 'janedoe',
        email: 'jane@example.com',
        password: this.hashPassword('password456'),
        pokemonIds: '{6, 9, 12}',
      },
      {
        username: 'bobsmith',
        email: 'bob@example.com',
        password: this.hashPassword('password789'),
        pokemonIds: '{25, 52, 94}',
      },
    ];

    // Insert each user
    for (const user of users) {
      await queryRunner.query(`
                INSERT INTO users (username, email, password, "pokemonIds")
                VALUES ('${user.username}', '${user.email}', '${user.password}', '${user.pokemonIds}')
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the mock users
    await queryRunner.query(`
            DELETE FROM users 
            WHERE username IN ('johndoe', 'janedoe', 'bobsmith')
        `);
  }
}
