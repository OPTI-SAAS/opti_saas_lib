# @optisaas/opti-saas-lib

A shared TypeScript library for Opti SaaS applications, providing type-safe resource authorization management and shared utilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @optisaas/opti-saas-lib
# or
yarn add @optisaas/opti-saas-lib
# or
pnpm add @optisaas/opti-saas-lib
```

## Features

- 🔐 **Type-safe Authorization System** - Resource-based permissions with TypeScript type safety
- 🏥 **Specialized Resources** - Support for specialized resources with domain-specific authorizations
- 🎯 **Client Helpers** - Utility functions for authorization management
- 📦 **Tree-shakeable** - Optimized bundle size with ES modules
- 🔧 **TypeScript First** - Written in TypeScript with full type definitions

## Usage

### Resource Authorizations

```typescript
import { getAuthorizationsOfResource, Resource } from '@optisaas/opti-saas-lib';

// Get all authorizations for a specific resource
const factureAuths = getAuthorizationsOfResource('FACTURE');
// Returns: ['FACTURE_CREATE', 'FACTURE_READ', 'FACTURE_UPDATE']

const avoirAuths = getAuthorizationsOfResource('AVOIR');
// Returns: ['AVOIR_IMPORT', 'AVOIR_EXPORT']
```

### Type Definitions

```typescript
import type { 
  ResourceAuthorizations, 
  Resource, 
  Authorisation 
} from '@optissaas/optis-saas-lib';

// Available resources
const resources: Resource[] = ['FACTURE', 'AVOIR'];

// Available authorizations
const authorizations: Authorisation[] = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'];

// Type-safe resource authorizations
const auth: ResourceAuthorizations = 'FACTURE_CREATE'; // ✅ Valid
const invalid: ResourceAuthorizations = 'FACTURE_DELETE'; // ❌ TypeScript error
```

### Specialized Resources

```typescript
import type { 
  SpecializedResourceAuthorizations,
  SpecializedResource 
} from '@optissaas/optis-saas-lib';

// Specialized resources with domain-specific permissions
const specializedAuth: SpecializedResourceAuthorizations = 
  'GENERAL_PRACTITIONER_HEALTH_RECORD_CREATE';
```

## Project Structure

```
src/
├── backoffice/     # Backoffice utilities
├── client/         # Client-side helpers
│   ├── helpers.ts  # Authorization helper functions
│   └── dtos/       # Data transfer objects
├── shared/         # Shared types and configuration
│   ├── config.ts   # Resource and authorization configuration
│   └── types.ts    # TypeScript type definitions
└── index.ts        # Main entry point
```

## Development

### Commands

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run in watch mode
pnpm start

# Run tests
pnpm test

# Lint code
pnpm lint

# Analyze bundle size
pnpm size
```

### Building

This library uses [tsup](https://tsup.egoist.dev/) for building. The output includes:
- CommonJS (CJS) format
- ES Module (ESM) format
- TypeScript type definitions

### Testing

Tests are written using Jest. Run them with:

```bash
pnpm test
```

## Publishing

This library is automatically published to npm using GitHub Actions when changes are pushed to the main branch. The version is managed in `package.json`.

To publish a new version:
1. Update the version in `package.json`
2. Commit and push to main
3. GitHub Actions will automatically build, test, and publish

## License

MIT © aymankaddioui

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
