import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserWithPokemonDto,
  UpdatePokemonIdsDto,
} from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Returns all users',
    type: UserResponseDto,
    isArray: true,
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by id with their Pokemon details including names',
  })
  @ApiParam({ name: 'id', description: 'The user id' })
  @ApiOkResponse({
    description:
      'Returns the user with the specified id and their Pokemon details (including names) fetched from the Pokemon API',
    type: UserWithPokemonDto,
  })
  async findById(@Param('id') id: string): Promise<UserWithPokemonDto> {
    return this.usersService.findByIdWithPokemon(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'The user has been successfully created',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Ensure pokemonIds is always an array
    const userData = {
      ...createUserDto,
      pokemonIds: createUserDto.pokemonIds || [],
    };
    return this.usersService.create(userData as any);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user including their Pokemon IDs' })
  @ApiParam({ name: 'id', description: 'The user id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description:
      'The user has been successfully updated with all provided fields including Pokemon IDs if provided',
    type: UserResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'The user id' })
  @ApiOkResponse({ description: 'The user has been successfully deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(Number(id));
  }

  @Put(':id/pokemon')
  @ApiOperation({ summary: "Update a user's Pokemon IDs" })
  @ApiParam({ name: 'id', description: 'The user id' })
  @ApiBody({ type: UpdatePokemonIdsDto })
  @ApiOkResponse({
    description: "The user's Pokemon IDs have been successfully updated",
    type: UserResponseDto,
  })
  async updatePokemonIds(
    @Param('id') id: string,
    @Body() updatePokemonIdsDto: UpdatePokemonIdsDto,
  ): Promise<User> {
    return this.usersService.updatePokemonIds(
      Number(id),
      updatePokemonIdsDto.pokemonIds,
    );
  }
}
