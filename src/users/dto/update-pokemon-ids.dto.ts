import { ApiProperty } from '@nestjs/swagger';

export class UpdatePokemonIdsDto {
  @ApiProperty({
    description: 'List of Pokemon IDs owned by the user',
    example: [1, 4, 7],
    type: [Number],
  })
  pokemonIds: number[];
}
