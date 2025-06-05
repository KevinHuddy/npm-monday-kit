# Monday.com Client Wrapper

A simplified TypeScript wrapper for the Monday.com SDK with built-in column value parsing and transformation.

## Features

- 🚀 Simplified API compared to raw Monday.com SDK
- 🔄 Automatic column value parsing and transformation
- 📊 Support for all Monday.com column types
- 🎯 Type-safe interfaces
- ⚡ Built with Bun for fast execution

## Installation

```bash
bun install
```

## Usage

### Basic Setup

```typescript
import { createMondayClient } from "./monday";

// Create client with your API token
const monday = createMondayClient("your-api-token");

// Get item column values (transformed)
const items = await monday.getItemColumnValues({ 
    id: "item-id", 
    columnIds: ["column1", "column2"] // optional
});

// Get subitems column values (transformed)
const subitems = await monday.getSubitemsColumnValues({ 
    id: "item-id"
});
```

### Environment Variables

Set your Monday.com API token as an environment variable:

```bash
MONDAY_API_TOKEN="your-token-here"
```

### Raw Data Access

If you need the original Monday.com data structure:

```typescript
// Get raw item data (untransformed)
const rawItems = await monday.getItemColumnValuesRaw({ id: "item-id" });

// Get raw subitems data (untransformed)
const rawSubitems = await monday.getSubitemsColumnValuesRaw({ id: "item-id" });
```

### Other Available Methods

```typescript
// List board columns
const columns = await monday.listBoardColumns("board-id");

// List workspaces
const workspaces = await monday.listWorkspaces();

// List boards in workspace
const boards = await monday.listWorkspaceBoards("workspace-id");

// User operations
const users = await monday.listUsers();
const user = await monday.getUserById("user-id");
const userByEmail = await monday.getUserByEmail("user@example.com");

// Item operations
const itemId = await monday.createItem(variables);
const updatedItemId = await monday.updateItem(variables);
```

## Column Value Transformation

The client automatically transforms Monday.com column values into more usable formats:

- **Status**: Returns the label string
- **Date**: Returns `{ date: string, time: string }` object
- **People**: Returns array of user IDs
- **Checkbox**: Returns boolean
- **Numbers**: Returns parsed number
- **Text**: Returns string value
- **Files**: Returns array with file details
- **And many more...**

## Project Structure

```
├── monday/
│   ├── common/
│   │   ├── client.ts        # Main Monday.com client
│   │   ├── helper.ts        # Column value parsing
│   │   ├── models.ts        # TypeScript interfaces
│   │   ├── queries.ts       # GraphQL queries
│   │   ├── mutations.ts     # GraphQL mutations
│   │   └── constants.ts     # Column type constants
│   └── index.ts            # Module exports
├── utils/
│   └── utils.ts            # Utility functions
└── index.ts                # Example usage
```

## Development

```bash
# Run with file watching
bun run dev

# Run once
bun run start
```

## Migration from Previous Version

If you were using the actions-based approach:

**Before:**
```typescript
const monday = createMondayUtils(token);
const items = await monday.getItemColumnValues(props);
```

**After:**
```typescript
const monday = createMondayClient(token);
const items = await monday.getItemColumnValues(props);
```

The API is nearly identical, but now you have direct access to all client methods. 