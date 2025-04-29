import axios, { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PokemonApiResponse {
  id: number;
  name: string;
  // Add other fields you might need in the future
}

export interface PokemonDetails {
  id: number;
  name: string;
}

@Injectable()
export class PokemonClient {
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>(
      'POKEMON_API_URL',
      'https://pokeapi.co/api/v2',
    );
  }

  async getPokemonById(id: number): Promise<PokemonDetails | null> {
    try {
      const response: AxiosResponse<PokemonApiResponse> = await axios.get(
        `${this.apiUrl}/pokemon/${id}`,
      );

      return {
        id: response.data.id,
        name: response.data.name,
      };
    } catch (error) {
      console.error(`Error fetching Pokemon with ID ${id}:`, error);
      return null;
    }
  }

  async getPokemonDetailsByIds(ids: number[]): Promise<PokemonDetails[]> {
    const pokemonPromises = ids.map((id) => this.getPokemonById(id));
    const pokemonResults = await Promise.all(pokemonPromises);

    // Filter out any null results
    return pokemonResults.filter(
      (pokemon): pokemon is PokemonDetails => pokemon !== null,
    );
  }
}
