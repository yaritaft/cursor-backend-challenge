import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import {
  initTestApp,
  closeTestApp,
  resetTestApp,
  TestAppContext,
} from './helpers/test-app.helper';
import axios from 'axios';

describe('UsersController (e2e)', () => {
  let testContext: TestAppContext;
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let axiosGetSpy: jest.SpyInstance;

  // Pokemon mock data used for tests
  const mockPokemonData = [
    { id: 1, name: 'bulbasaur' },
    { id: 4, name: 'charmander' },
    { id: 7, name: 'squirtle' },
  ];

  // Helper function to extract Pokemon ID from URL
  const getPokemonIdFromUrl = (url: string): number | null => {
    for (const pokemon of mockPokemonData) {
      if (url.includes(`/pokemon/${pokemon.id}`)) {
        return pokemon.id;
      }
    }
    return null;
  };

  beforeAll(async () => {
    // Initialize test app with the helper
    testContext = await initTestApp();

    // Extract what we need from the context
    app = testContext.app;
    usersRepository = testContext.usersRepository;

    // Setup axios spy for Pokemon endpoints
    const originalAxiosGet = (url: string) => axios.get(url);
    axiosGetSpy = jest.spyOn(axios, 'get').mockImplementation((url: string) => {
      // Check if the URL contains a Pokemon endpoint we want to mock
      const pokemonId = getPokemonIdFromUrl(url);
      if (pokemonId !== null) {
        const pokemon = mockPokemonData.find((p) => p.id === pokemonId);
        return Promise.resolve({ data: pokemon });
      }

      // For other URLs, call the original axios.get
      return originalAxiosGet(url);
    });
  });

  afterAll(async () => {
    // Restore axios mock
    axiosGetSpy.mockRestore();

    // Clean up test app resources
    await closeTestApp(testContext);
  });

  beforeEach(async () => {
    // Reset test state between tests
    await resetTestApp(testContext);

    // Reset axios mock calls
    axiosGetSpy.mockClear();
  });

  describe('GET /users', () => {
    it('should return an empty array when no users exist', () => {
      return request(app.getHttpServer()).get('/users').expect(200).expect([]);
    });

    it('should return all users', async () => {
      // Create test users
      const usersData = [
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password1',
          pokemonIds: [1, 4],
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password2',
          pokemonIds: [7],
        },
      ];

      await usersRepository.save(usersData);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      interface UserResponse {
        id: number;
        username: string;
        email: string;
        pokemonIds: number[];
      }

      const responseBody = response.body as UserResponse[];
      expect(responseBody).toHaveLength(2);
      expect(responseBody[0]?.username).toBe('user1');
      expect(responseBody[1]?.username).toBe('user2');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user with pokemon details', async () => {
      // Create a test user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        pokemonIds: [1, 4],
      };

      const user = await usersRepository.save(userData);

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      interface UserWithPokemonResponse {
        id: number;
        username: string;
        email: string;
        pokemonIds: number[];
        pokemon: Array<{ id: number; name: string }>;
      }

      const responseBody = response.body as UserWithPokemonResponse;
      expect(responseBody.id).toBe(user.id);
      expect(responseBody.username).toBe('testuser');
      expect(responseBody.email).toBe('test@example.com');
      expect(responseBody.pokemonIds).toEqual([1, 4]);
      expect(responseBody.pokemon).toHaveLength(2);
      expect(responseBody.pokemon[0].name).toBe('bulbasaur');
      expect(responseBody.pokemon[1].name).toBe('charmander');

      // Verify axios was called for Pokemon endpoints
      expect(axiosGetSpy).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if user does not exist', () => {
      return request(app.getHttpServer()).get('/users/9999').expect(404);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'newpassword123',
        pokemonIds: [7],
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      const responseBody = response.body as User;
      expect(responseBody.id).toBeDefined();
      expect(responseBody.username).toBe('newuser');
      expect(responseBody.email).toBe('new@example.com');
      expect(responseBody.pokemonIds).toEqual([7]);

      // Verify the user was actually saved to the database
      const savedUser = await usersRepository.findOneBy({
        id: responseBody.id,
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.username).toBe('newuser');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      // Create a test user
      const userData = {
        username: 'updateuser',
        email: 'update@example.com',
        password: 'password123',
        pokemonIds: [1],
      };

      const user = await usersRepository.save(userData);

      // Update the user
      const updateData = {
        username: 'updatedname',
        pokemonIds: [1, 4],
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send(updateData)
        .expect(200);

      const responseBody = response.body as User;
      expect(responseBody.id).toBe(user.id);
      expect(responseBody.username).toBe('updatedname');
      expect(responseBody.email).toBe('update@example.com'); // Should not change
      expect(responseBody.pokemonIds).toEqual([1, 4]);

      // Verify the changes were saved to the database
      const updatedUser = await usersRepository.findOneBy({ id: user.id });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.username).toBe('updatedname');
      expect(updatedUser?.pokemonIds).toEqual([1, 4]);
    });

    it('should return 404 if user does not exist', () => {
      return request(app.getHttpServer())
        .put('/users/9999')
        .send({ username: 'nonexistent' })
        .expect(404);
    });
  });

  describe('PUT /users/:id/pokemon', () => {
    it("should update a user's Pokemon IDs", async () => {
      // Create a test user
      const userData = {
        username: 'pokemonuser',
        email: 'pokemon@example.com',
        password: 'password123',
        pokemonIds: [1],
      };

      const user = await usersRepository.save(userData);

      // Update Pokemon IDs
      const updateData = {
        pokemonIds: [4, 7],
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}/pokemon`)
        .send(updateData)
        .expect(200);

      const responseBody = response.body as User;
      expect(responseBody.id).toBe(user.id);
      expect(responseBody.username).toBe('pokemonuser');
      expect(responseBody.pokemonIds).toEqual([4, 7]);

      // Verify the changes were saved to the database
      const updatedUser = await usersRepository.findOneBy({ id: user.id });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.pokemonIds).toEqual([4, 7]);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      // Create a test user
      const userData = {
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123',
        pokemonIds: [],
      };

      const user = await usersRepository.save(userData);

      // Delete the user
      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200);

      // Verify the user was deleted from the database
      const deletedUser = await usersRepository.findOneBy({ id: user.id });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 if user does not exist', () => {
      return request(app.getHttpServer()).delete('/users/9999').expect(404);
    });
  });
});
