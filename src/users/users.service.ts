import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { UserWithPokemonDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByIdWithPokemon(id: number): Promise<UserWithPokemonDto> {
    const result = await this.usersRepository.findByIdWithPokemon(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      pokemonIds: result.user.pokemonIds,
      pokemon: result.pokemon,
    };
  }

  create(userData: Omit<User, 'id'>): Promise<User> {
    return this.usersRepository.create(userData);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.update(id, userData);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updatePokemonIds(id: number, pokemonIds: number[]): Promise<User> {
    const user = await this.usersRepository.updatePokemonIds(id, pokemonIds);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
