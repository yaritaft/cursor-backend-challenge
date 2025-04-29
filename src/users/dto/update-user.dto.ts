import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'The username of the user',
    example: 'johndoe',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'The email of the user',
    example: 'john@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'The password of the user',
    example: 'newpassword123',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'List of Pokemon IDs owned by the user',
    example: [1, 4, 7],
    type: [Number],
  })
  pokemonIds?: number[];
}
