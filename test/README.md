# Integration Tests

This directory contains integration tests for the user endpoints. These tests use a real SQL test database (a separate database from the development database) and mock HTTP responses from the Pokemon API.

## Setup

The integration tests require:

1. A PostgreSQL database server
2. The ability to create a database called `usersdb_test` (or modify `.env.test` to use a different database name)

## Configuration

The test database is configured in `.env.test`. You can modify these settings to match your environment:

```bash
# Database Configuration for Testing
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=usersdb_test
DATABASE_SYNC=true

# API Configuration
POKEMON_API_URL=https://pokeapi.co/api/v2
```

## Running Tests

There are two ways to run the integration tests:

### Option 1: Using the setup script

This will create the test database if it doesn't exist and then run the tests:

```bash
npm run test:e2e:setup
```

### Option 2: Manually

If you've already set up the test database, you can run the tests directly:

```bash
npm run test:e2e
```

## Test Structure

The integration tests are organized by endpoint:

- `GET /users`: Tests for retrieving all users
- `GET /users/:id`: Tests for retrieving a user with their Pokemon details
- `POST /users`: Tests for creating a new user
- `PUT /users/:id`: Tests for updating a user
- `PUT /users/:id/pokemon`: Tests for updating a user's Pokemon IDs
- `DELETE /users/:id`: Tests for deleting a user

Each test verifies both the HTTP response and that the database was updated correctly.

## Mocking

The tests use Jest's `spyOn` to selectively mock HTTP requests to the Pokemon API endpoints. This approach:

1. Uses a simple string matching to identify Pokemon endpoint paths (`/pokemon/{id}`)
2. Works with any base URL as long as it contains the matching endpoint path
3. Intercepts requests regardless of domain (e.g., both `localhost:3000/pokemon/1` and `pokeapi.co/api/v2/pokemon/1`)
4. Allows verification of the exact API calls made during the tests

The mock data includes information for:

- Bulbasaur (ID: 1)
- Charmander (ID: 4)
- Squirtle (ID: 7)

Example of the simple path matching implementation:

```typescript
// Helper function to extract Pokemon ID from URL
const getPokemonIdFromUrl = (url: string): number | null => {
  for (const pokemon of mockPokemonData) {
    if (url.includes(`/pokemon/${pokemon.id}`)) {
      return pokemon.id;
    }
  }
  return null;
};

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
```

This straightforward approach allows us to match endpoint paths regardless of the base URL, ensuring our tests work correctly no matter where the application is hosted.
