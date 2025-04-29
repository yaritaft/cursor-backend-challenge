import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { PokemonClient, PokemonDetails } from '../clients/pokemon.client';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private pokemonClient: PokemonClient,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByIdWithPokemon(
    id: number,
  ): Promise<{ user: User; pokemon: PokemonDetails[] } | null> {
    const user = await this.findById(id);

    if (!user) {
      return null;
    }

    const pokemon = await this.pokemonClient.getPokemonDetailsByIds(
      user.pokemonIds,
    );

    return { user, pokemon };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  create(userData: Omit<User, 'id'>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async updatePokemonIds(
    id: number,
    pokemonIds: number[],
  ): Promise<User | null> {
    await this.usersRepository.update(id, { pokemonIds });
    return this.findById(id);
  }

  async addPokemonToUser(
    userId: number,
    pokemonId: number,
  ): Promise<User | null> {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    // Prevent duplicates
    if (!user.pokemonIds.includes(pokemonId)) {
      user.pokemonIds.push(pokemonId);
      await this.usersRepository.save(user);
    }

    return user;
  }

  async removePokemonFromUser(
    userId: number,
    pokemonId: number,
  ): Promise<User | null> {
    const user = await this.findById(userId);

    if (!user) {
      return null;
    }

    user.pokemonIds = user.pokemonIds.filter((id) => id !== pokemonId);
    await this.usersRepository.save(user);

    return user;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    return result.affected !== 0;
  }
}
