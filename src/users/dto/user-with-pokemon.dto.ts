import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';
import { PokemonDetails } from '../../clients/pokemon.client';

export class UserWithPokemonDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'List of Pokemon IDs owned by the user',
    example: [1, 4, 7],
    type: [Number],
  })
  pokemonIds: number[];

  @ApiProperty({
    description: 'Details of Pokemon owned by the user',
    example: [
      { id: 1, name: 'bulbasaur' },
      { id: 4, name: 'charmander' },
      { id: 7, name: 'squirtle' },
    ],
    type: 'array',
  })
  pokemon: PokemonDetails[];

  constructor(user: User, pokemon: PokemonDetails[]) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.pokemonIds = user.pokemonIds;
    this.pokemon = pokemon;
  }
}
