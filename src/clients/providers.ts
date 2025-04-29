import { Provider } from '@nestjs/common';
import { PokemonClient } from './pokemon.client';

export const ClientsProviders: Provider[] = [PokemonClient];
