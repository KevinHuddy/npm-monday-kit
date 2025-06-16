# @ntr.dev/monday-kit

A powerful, type-safe TypeScript wrapper for the Monday.com SDK with built-in column value parsing, transformation, and validation. Designed specifically for seamless integration with Pipedream workflows and automation platforms.

## 🚀 Features

- **🎯 Type-Safe**: Full TypeScript support with comprehensive type definitions
- **🔄 Smart Column Parsing**: Automatic transformation of Monday.com column values to usable data types
- **⚡ Optimized for Pipedream**: Pre-configured for Pipedream workflow integration
- **🧠 Intelligent Caching**: Built-in board column caching to reduce API calls
- **🛡️ Error Handling**: Robust validation and error handling for production use
- **📊 All Column Types**: Support for all Monday.com column types (35+ types)
- **🔌 Service-Based Architecture**: Organized by functionality (Items, Boards, Users, etc.)

## 📦 Installation

```bash
bun add @ntr.dev/monday-kit
```

## 🏁 Quick Start

### Basic Setup

```typescript
// Import the library
import { MondayClient } from '@ntr.dev/monday-kit';

// Initialize the client
const monday = new MondayClient('your-monday-api-token');

// Get item with transformed column values
const items = await monday.item.getItem({ 
  itemId: "item-id", 
  columnIds: ["status", "person", "date"] // optional - get specific columns
});

console.log(items); // Transformed, easy-to-use data
```

### Environment Variables

Set your Monday.com API token as an environment variable:

```bash
MONDAY_API_TOKEN="your-token-here"
```

```typescript
const monday = new MondayClient(process.env.MONDAY_API_TOKEN);
```

## 🔧 MondayClient API Reference

### Core Services

The `MondayClient` provides access to six main services:

- **`item`** - Item operations (create, read, update, search)
- **`board`** - Board information (columns, groups)
- **`workspace`** - Workspace and board listing
- **`user`** - User management and lookup
- **`update`** - Item updates and comments
- **`subitem`** - Subitem operations

---

## 📋 Items Service

### `item.getItem(params)`

Retrieve a single item with all its column values (parsed and transformed).

**Parameters:**
```typescript
{
  itemId: string,       // Monday.com item ID
  columnIds?: string[]  // Optional: specific column IDs to fetch
}
```

**Returns:** `Promise<Items>` - Array of transformed item objects

**Example:**
```typescript
const items = await monday.item.getItem({ 
  itemId: "1234567890",
  columnIds: ["status", "person", "date"]
});

// Result:
// [
//   {
//     id: "1234567890",
//     name: "My Task",
//     status: "Working on it",  // Parsed from status column
//     person: [12345, 67890],   // Array of user IDs
//     date: { date: "2024-01-15", time: "14:30:00" }
//   }
// ]
```

### `item.createItem(params)`

Create a new item on a Monday.com board.

**Parameters:**
```typescript
{
  itemName: string,                    // Name of the new item
  boardId: string,                     // Target board ID
  groupId?: string,                    // Optional: specific group ID
  columnValues?: Record<string, any>,  // Optional: Column values to set
  createLabels?: boolean               // Optional: Auto-create missing status labels; (default: false)
}
```

**Returns:** `Promise<string>` - Created item ID

**Example:**
```typescript
const itemId = await monday.item.createItem({
  itemName: "New Task",
  boardId: "123456789",
  groupId: "topics",
  columnValues: {
    status: "Working on it",
    person: [12345],
    date: "2024-01-15T14:30:00Z",
    text: "Task description"
  },
  createLabels: true
});
```

### `item.updateItem(params)`

Update column values for an existing item.

**Parameters:**
```typescript
{
  itemId: string,                      // Item ID to update
  columnValues: Record<string, any>,   // Column values to update
  boardId: string,                     // Board ID (required for validation)
  createLabels?: boolean               // Optional: Auto-create missing status labels; (default: false)
}
```

**Returns:** `Promise<string>` - Updated item ID

**Example:**
```typescript
const itemId = await monday.item.updateItem({
  itemId: "1234567890",
  boardId: "123456789",
  columnValues: {
    status: "Done",
    person: [12345, 67890],
    numbers: 42
  }
});
```

### `item.listItemsByColumnValues(params)`

Search for items by specific column values.

**Parameters:**
```typescript
{
  boardId: string,                              // Board to search in
  columns: Record<string, string | string[]>,   // Column filters
  limit?: number,                               // Optional: Max results (default: 25)
  columnIds?: string[]                          // Optional: Columns to return
}
```

**Returns:** `Promise<Items>` - Array of matching items

**Example:**
```typescript
const items = await monday.item.listItemsByColumnValues({
  boardId: "123456789",
  columns: {
    status: "Working on it",
    person: ["12345"]
  },
  limit: 50,
  columnIds: ["status", "date", "text"]
});
```

---

## 📊 Boards Service

### `board.listBoardColumns(params)`

Get all columns for a specific board.

**Parameters:**
```typescript
{
  boardId: string  // Board ID
}
```

**Returns:** `Promise<Column[]>` - Array of board columns

**Example:**
```typescript
const columns = await monday.board.listBoardColumns({ boardId: "123456789" });

// Result:
// [
//   { id: "status", title: "Status", type: "status" },
//   { id: "person", title: "Person", type: "people" },
//   { id: "date", title: "Due Date", type: "date" }
// ]
```

### `board.listBoardGroups(params)`

Get all groups for a specific board.

**Parameters:**
```typescript
{
  boardId: string  // Board ID
}
```

**Returns:** `Promise<Group[]>` - Array of board groups

**Example:**
```typescript
const groups = await monday.board.listBoardGroups({ boardId: "123456789" });
```

---

## 🏢 Workspaces Service

### `workspace.listWorkspaces()`

Get all workspaces accessible to the current user.

**Parameters:** None

**Returns:** `Promise<Workspace[]>` - Array of workspaces

**Example:**
```typescript
const workspaces = await monday.workspace.listWorkspaces();
```

### `workspace.listWorkspaceBoards(params)`

Get all boards in a specific workspace.

**Parameters:**
```typescript
{
  workspaceId: string  // Workspace ID
}
```

**Returns:** `Promise<Board[]>` - Array of boards

**Example:**
```typescript
const boards = await monday.workspace.listWorkspaceBoards({ 
  workspaceId: "12345" 
});
```

---

## 👥 Users Service

### `user.listUsers()`

Get all users in the account.

**Parameters:** None

**Returns:** `Promise<User[]>` - Array of users

**Example:**
```typescript
const users = await monday.user.listUsers();
```

### `user.getUserById(params)`

Get a specific user by their ID.

**Parameters:**
```typescript
{
  userId: string  // User ID
}
```

**Returns:** `Promise<User>` - User object

**Example:**
```typescript
const user = await monday.user.getUserById({ userId: "12345" });
```

### `user.getUserByEmail(params)`

Get a specific user by their email address.

**Parameters:**
```typescript
{
  email: string  // User email
}
```

**Returns:** `Promise<User>` - User object

**Example:**
```typescript
const user = await monday.user.getUserByEmail({ 
  email: "user@company.com" 
});
```

---

## 💬 Updates Service

### `update.createUpdate(params)`

Create an update (comment) on an item.

**Parameters:**
```typescript
{
  itemId: string,      // Item ID
  updateBody: string   // Update content
}
```

**Returns:** `Promise<string>` - Created update ID

**Example:**
```typescript
const updateId = await monday.update.createUpdate({
  itemId: "1234567890",
  updateBody: "Task completed successfully!"
});
```

---

## 📎 Subitems Service

### `subitem.listSubitems(params)`

Get all subitems for a parent item.

**Parameters:**
```typescript
{
  itemId: string,       // Parent item ID
  columnIds?: string[]  // Optional: specific columns to fetch
}
```

**Returns:** `Promise<Subitems>` - Array of transformed subitem objects

**Example:**
```typescript
const subitems = await monday.subitem.listSubitems({ 
  itemId: "1234567890",
  columnIds: ["status", "person"]
});
```

### `subitem.createSubitem(params)`

Create a new subitem under a parent item.

**Parameters:**
```typescript
{
  itemName: string,                    // Name of the new subitem
  parentItemId: string,                // Parent item ID
  columnValues?: Record<string, any>,  // Optional: Column values to set
  createLabels?: boolean               // Optional: Auto-create missing status labels; (default: false)
}
```

**Returns:** `Promise<string>` - Created subitem ID

**Example:**
```typescript
const subitemId = await monday.subitem.createSubitem({
  itemName: "New Subtask",
  parentItemId: "1234567890",
  columnValues: {
    status: "Working on it",
    person: [12345]
  },
  createLabels: true
});
```

---

## 🔄 Column Value Transformation

The library automatically transforms Monday.com's complex column values into simple, usable formats:

| Column Type | Input Format | Output Format |
|-------------|--------------|---------------|
| **Status** | `"Working on it"` | `"Working on it"` |
| **Date** | `"2024-01-15T14:30:00Z"` | `{ date: "2024-01-15", time: "14:30:00" }` |
| **People** | `[12345, 67890]` | `[12345, 67890]` |
| **Checkbox** | `true` | `true` |
| **Numbers** | `"42"` | `42` |
| **Text** | `"Hello"` | `"Hello"` |
| **Email** | `"user@example.com"` | `"user@example.com"` |
| **Phone** | `"5551234567:US"` | `"+15551234567"` |
| **Dropdown** | `["label1", "label2"]` | `["label1", "label2"]` |
| **Timeline** | `"2024-01-01:2024-01-31"` | `{ from: "2024-01-01", to: "2024-01-31" }` |
| **Files** | File objects | `[{ name: "file.pdf", assetId: "123", linkToFile: "..." }]` |

### Supported Column Types (35+)

- Auto Number, Button, Checkbox, Color Picker
- Board Relation, Country, Creation Log, Date
- Dependency, Dropdown, Email, Files
- Formula, Hour, Item ID, Last Updated
- Link, Location, Long Text, Mirror
- Doc, Name, Numbers, People
- Phone, Progress, Rating, Status
- Tags, Text, Timeline, Time Tracking
- Vote, Week, World Clock

---

## 🔌 Pipedream Integration

### Basic Pipedream Workflow

```typescript
import { MondayClient } from '@ntr.dev/monday-kit';

export default defineComponent({
  props: {
    monday_api_token: {
      type: "string",
      secret: true,
      label: "Monday.com API Token"
    }
  },
  async run({ steps, $ }) {
    const monday = new MondayClient(this.monday_api_token);
    
    // Example: Get item and transform data
    const items = await monday.item.getItem({ 
      itemId: steps.trigger.event.itemId,
      columnIds: ["status", "person", "date"]
    });
    
    return { 
      transformed_items: items,
      count: items.length 
    };
  }
});
```

### Pipedream Webhook Handler

```typescript
export default defineComponent({
  async run({ steps, $ }) {
    const monday = new MondayClient(process.env.MONDAY_API_TOKEN);
    
    // Handle Monday.com webhook data
    const webhookData = steps.trigger.event;
    
    if (webhookData.event.type === 'create_item') {
      const items = await monday.item.getItem({ 
        itemId: webhookData.event.itemId 
      });
      
      // Process the transformed data
      return { processed_item: items[0] };
    }
  }
});
```

### Error Handling in Pipedream

```typescript
export default defineComponent({
  async run({ steps, $ }) {
    const monday = new MondayClient(this.monday_api_token);
    
    try {
      const items = await monday.item.getItem({ itemId: "invalid-id" });
      return { success: true, data: items };
    } catch (error) {
      // Pipedream will catch and display this error
      throw new Error(`Monday.com API error: ${error.message}`);
    }
  }
});
```

## 🛠️ Advanced Usage

### Legacy Method Support

For backward compatibility, the original method structure is still available:

```typescript
// New service-based approach (recommended)
const items = await monday.item.getItem({ itemId: "123" });

// Legacy method approach (still supported)
const items = await monday.items.get({ itemId: "123" });
```

### Caching Control

```typescript
// Clear cache for a specific board (available on ItemService and SubitemService)
monday.item.clearCache("board-id");

// Clear all cached data
monday.item.clearCache();
```

### Direct API Access

```typescript
// Access the underlying Monday.com SDK
const response = await monday.api({
  query: 'query { me { name email } }',
  variables: {}
});
```

### Batch Operations

```typescript
// Create multiple items efficiently
const itemIds = await Promise.all([
  monday.item.createItem({ itemName: "Task 1", boardId: "123" }),
  monday.item.createItem({ itemName: "Task 2", boardId: "123" }),
  monday.item.createItem({ itemName: "Task 3", boardId: "123" })
]);
```

## 🐛 Error Handling

The library provides comprehensive error handling:

```typescript
try {
  const items = await monday.item.getItem({ itemId: "item-id" });
} catch (error) {
  if (error.message.includes('itemId is required')) {
    // Handle validation error
  } else if (error.message.includes('API')) {
    // Handle API error
  }
}
```

## 📝 TypeScript Support

Full TypeScript definitions are included:

```typescript
import { MondayClient, Items, Column, User } from '@ntr.dev/monday-kit';

const monday: MondayClient = new MondayClient(token);
const items: Items = await monday.item.getItem({ itemId: "123" });
```

## 📈 Performance Tips

1. **Use Column Filtering**: Specify `columnIds` to fetch only needed data
2. **Leverage Caching**: Board columns are automatically cached
3. **Batch Operations**: Use `Promise.all()` for multiple concurrent requests
4. **Error Boundaries**: Implement proper error handling in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

ISC License

## 🔗 Related Links

- [Monday.com API Documentation](https://developer.monday.com/api-reference/)
- [Pipedream Documentation](https://pipedream.com/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🪵 Update Logs

- **0.0.11**: Fixed a bug where it was crashing if there was no files in a file column when fetching item
- **0.0.12**: Added the possibility to simply pass my own object to date format, when i dont want the time
- **0.0.13**: Added the possibility to pass a props to show dipslay_value on connected columns and dependency.. Not sure about how I implemented this one 🤷. Feedback welcomed.
- **0.0.14**: Filtered out unwrittable columns types from create queries so i can simply give .get() data to .create() seamlessly.  

---

**Made with ❤️ by [NTR.DEV](https://ntr.dev)** for the automation community. 