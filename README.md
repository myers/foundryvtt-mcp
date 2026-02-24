# FoundryVTT MCP Server

A Model Context Protocol (MCP) server that integrates with FoundryVTT, allowing AI assistants to interact with your tabletop gaming sessions. Query actors, roll dice, generate content, and manage your game world through natural language.

## Features

### Core Functionality

- **Dice Rolling** - Roll dice with standard RPG notation
- **Data Querying** - Search and inspect actors, items, scenes, and journal entries
- **Game State** - Access combat status, chat messages, user list, and world information
- **Content Generation** - Generate NPCs, loot tables, and rule lookups
- **World Search** - Full-text search across all game entities
- **Write Operations** - Create, update, and delete actors; add embedded items; organize with folders

### System-Aware Output

The server auto-detects the connected game system and adapts its behavior:

- **Tool descriptions** are enriched with system-specific guidance (valid types, field paths, workflows)
- **Search results** use system-appropriate formatting (e.g., DEF/TOUGH for Expanse instead of HP/AC for D&D)
- **Schema introspection** via `get_system_template` returns the actual Actor/Item template plus curated field docs and step-by-step recipes

Currently supported systems:

| System | ID | Status |
|--------|----|--------|
| **The Expanse RPG** | `expanse` | Fully supported |
| D&D 5e / other systems | — | Generic fallback (works, but output uses D&D-style formatting) |

Adding a new system requires only a single config file — see [Adding a New System](#adding-a-new-system).

### Real-time Integration

- **Live Connection** - Socket.IO connection loads complete world state on connect
- **Combat Tracking** - Access initiative order and combat state
- **User Awareness** - See who's online and their current status
- **Chat Messages** - Read recent chat history

## Installation

### Prerequisites

- Node.js 18+
- FoundryVTT server running with an active world
- MCP-compatible AI client (Claude Desktop, etc.)

### Quick Setup (Recommended)

**Interactive Setup Wizard:**
```bash
git clone <repository-url>
cd foundry-mcp-server
npm install
npm run setup-wizard
```

The setup wizard will:
- Automatically detect your FoundryVTT server
- Test connectivity and authentication
- Generate your `.env` configuration file
- Validate the complete setup

### Manual Setup

1. **Clone and install:**

```bash
git clone <repository-url>
cd foundry-mcp-server
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your FoundryVTT details
```

3. **Required environment variables:**

```env
FOUNDRY_URL=http://localhost:30000
FOUNDRY_USERNAME=your_username
FOUNDRY_PASSWORD=your_password
```

4. **Test and start:**

```bash
npm run test-connection  # Verify setup
npm run build
npm start
```

### Development Mode

```bash
npm run dev
```

## FoundryVTT Configuration

The MCP server connects to FoundryVTT via Socket.IO using a standard FoundryVTT user account. No custom modules are required for full game data access.

> **Important:** The MCP server holds a persistent Socket.IO session as the configured user. FoundryVTT does not allow two simultaneous sessions for the same user, so **you will not be able to log in to FoundryVTT in your browser as the same user** while the MCP server is running. Create a dedicated user account for the MCP server (e.g., "MCP" or "AI Assistant") with Gamemaster or Assistant GM permissions, and use a different account for your own browser session.

### Setup

1. Ensure FoundryVTT is running with an active world (not on the setup screen)
2. **Create a dedicated FoundryVTT user account for the MCP server** (do not reuse your personal login)
3. Add credentials to your `.env` file:

```env
FOUNDRY_URL=http://localhost:30000
FOUNDRY_USERNAME=your_username
FOUNDRY_PASSWORD=your_password
```

The server authenticates via a 4-step Socket.IO flow:
1. Fetches the `/join` page to obtain a session cookie
2. Extracts the session cookie from the response
3. Resolves the username to a user ID (or uses `FOUNDRY_USER_ID` if set)
4. Emits `joinGame` with credentials to receive the complete world state

### Optional: Diagnostics Tools

Installing the **Foundry Local REST API** module adds 5 server monitoring tools (`get_recent_logs`, `search_logs`, `get_system_health`, `diagnose_errors`, `get_health_status`):

1. In FoundryVTT: **Setup** > **Add-on Modules** > **Install Module**
2. Paste: `https://github.com/laurigates/foundryvtt-mcp/releases/latest/download/module.json`
3. Enable the module in your world and copy the generated API key
4. Add to `.env`:
   ```env
   FOUNDRY_API_KEY=your_api_key_here
   ```

### Required Permissions

Your FoundryVTT user needs these permissions:

- View actors, items, scenes, and journals
- Access compendium data
- Use dice rolling API

## Usage

### Basic Queries

Ask your AI assistant things like:

**Dice Rolling:**

- "Roll 1d20+5 for an attack roll"
- "Roll 4d6 drop lowest for ability scores"
- "Roll 2d10+3 for damage"

**Game Data:**

- "Show me all the NPCs in this scene"
- "Find magic weapons in the party's inventory"
- "What's the current combat initiative order?"
- "Search for healing potions"

**Content Generation:**

- "Generate a random NPC merchant"
- "Create loot for a CR 5 encounter"
- "Look up the grappling rules"

**World Search:**

- "Search the world for anything related to dragons"
- "Give me a summary of the current world state"
- "Who's online right now?"

## Available Tools

### Data Access

- `search_actors` - Find characters, NPCs, monsters
- `get_actor_details` - Detailed character information
- `search_items` - Find equipment, spells, consumables
- `get_scene_info` - Current scene details
- `search_journals` - Search notes and handouts
- `get_journal` - Retrieve a specific journal entry
- `get_users` - List online users and their status
- `get_combat_state` - Combat state and initiative order
- `get_chat_messages` - Recent chat history

### World

- `search_world` - Full-text search across all game entities
- `get_world_summary` - Overview of the current world state
- `refresh_world_data` - Reload world data from FoundryVTT

### Game Mechanics

- `roll_dice` - Roll dice with any formula
- `lookup_rule` - Game rules and spell descriptions

### Content Generation

- `generate_npc` - Create random NPCs
- `generate_loot` - Create treasure appropriate for level

### Write Operations

- `create_actor` - Create characters, NPCs, or other actors with system-specific data
- `update_actor` - Update fields on existing actors using dot-notation paths
- `delete_actor` - Remove an actor from the world
- `add_actor_items` - Add embedded items (weapons, talents, etc.) to an actor
- `create_folder` - Create organizational folders for any document type

### System Introspection

- `get_system_template` - View the Actor/Item schema for the connected system, including field docs and step-by-step recipes
- `get_raw_actor` - Inspect the full raw JSON of any actor (useful for understanding system-specific data shapes)

### Diagnostics (Optional — requires REST API module)

- `get_recent_logs` - Retrieve filtered FoundryVTT logs
- `search_logs` - Search logs with regex patterns
- `get_system_health` - Server performance and health metrics
- `diagnose_errors` - Analyze errors with troubleshooting suggestions
- `get_health_status` - Comprehensive health diagnostics

## Available Resources

The server exposes these FoundryVTT resources:

- `foundry://actors` - All actors in the world
- `foundry://items` - All items in the world
- `foundry://scenes` - All scenes
- `foundry://scenes/current` - Current active scene
- `foundry://journals` - All journal entries
- `foundry://users` - Online users
- `foundry://combat` - Active combat state
- `foundry://world/settings` - World and campaign settings
- `foundry://system/diagnostics` - System diagnostics (requires REST API module)

## Configuration

### Server Settings

Edit `.env` to customize:

```env
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Performance
FOUNDRY_TIMEOUT=10000      # Request timeout (ms)
FOUNDRY_RETRY_ATTEMPTS=3   # Retry failed requests
```

### Security

- Limit FoundryVTT user permissions to minimum required
- Run server on internal network only
- Monitor logs for suspicious activity

## Diagnostics & Troubleshooting

### Built-in Diagnostics

The server includes diagnostic tools to help troubleshoot connection and performance issues:

**Connection Testing:**
```bash
# Test complete MCP connection and functionality
npm run test-connection

# Clean build and test setup
npm run setup
```

**Diagnostic Tools (via AI assistant):**
- **System Health:** "Get the FoundryVTT system health status" (requires REST API module)
- **Error Analysis:** "Diagnose recent errors and provide recommendations" (requires REST API module)
- **Log Search:** "Search logs for 'connection' patterns in the last hour" (requires REST API module)

### Connection Issues

```bash
# Test FoundryVTT is accessible
curl http://localhost:30000

# Check server logs
npm run dev  # Shows detailed logging
```

### Common Problems

**"Failed to connect to FoundryVTT"**

- Verify FOUNDRY_URL is correct
- Check if FoundryVTT is running with an active world
- Ensure the URL is accessible from where the MCP server runs

**"Authentication failed"**

- Verify username and password match a FoundryVTT user exactly (case-sensitive)
- Check user permissions in FoundryVTT
- Try setting `FOUNDRY_USER_ID` to the 16-character document `_id`

**"Cannot log in to FoundryVTT while MCP is running"**

- This is expected — FoundryVTT only allows one session per user. Create a dedicated user for the MCP server and use a different account for your browser session.

**"Tool not found" errors**

- Update to latest server version
- Check tool name spelling
- Review available tools in logs

## Development

### Project Structure

```
src/
├── config/              # Zod-validated configuration
├── foundry/
│   ├── auth.ts          # Socket.IO 4-step authentication
│   ├── client.ts        # FoundryVTT client with worldData cache
│   └── types.ts         # TypeScript interfaces + WorldData
├── systems/
│   ├── types.ts         # SystemConfig interface + related types
│   ├── registry.ts      # Config resolution + singleton management
│   ├── expanse.ts       # The Expanse RPG system config
│   └── index.ts         # Re-exports
├── tools/
│   ├── definitions.ts   # Tool schemas + system-aware enrichment
│   ├── router.ts        # Tool request routing
│   ├── resources.ts     # MCP resource definitions
│   └── handlers/        # Per-tool handler implementations
├── diagnostics/         # Optional REST API diagnostics
├── utils/               # Logger, cache utilities
└── index.ts             # MCP server entry point
```

### Adding New Tools

1. Define tool schema in `src/tools/definitions.ts`
2. Add handler in `src/tools/handlers/`
3. Wire the handler in `src/tools/router.ts`
4. Add TypeScript types in `src/foundry/types.ts` if needed
5. Test with your AI assistant

### Adding a New System

To add support for a new game system (e.g., Pathfinder 2e):

1. Create `src/systems/pf2e.ts` implementing the `SystemConfig` interface
2. Add `pf2e: pf2eConfig` to the map in `src/systems/registry.ts`
3. Re-export from `src/systems/index.ts`

No other files need to change. The `SystemConfig` interface requires:

- **actorTypes / itemTypes** — valid types with key field documentation
- **toolGuidance** — text appended to tool descriptions when this system is active
- **recipes** — step-by-step workflows (e.g., "Create a PF2e NPC")
- **formatters** — functions for actor summaries, details, item summaries, and combatant lines

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

### Building

```bash
# Development build
npm run build

# Clean build
npm run clean && npm run build
```

## API Reference

### Environment Variables

| Variable                 | Required | Description                         | Default       |
| ------------------------ | -------- | ----------------------------------- | ------------- |
| `FOUNDRY_URL`            | Yes      | FoundryVTT server URL               | -             |
| `FOUNDRY_USERNAME`       | Yes      | FoundryVTT username                 | -             |
| `FOUNDRY_PASSWORD`       | Yes      | FoundryVTT password                 | -             |
| `FOUNDRY_USER_ID`        | No       | 16-char document `_id` (bypasses username resolution) | - |
| `FOUNDRY_API_KEY`        | No       | REST API module key (enables diagnostics) | -       |
| `LOG_LEVEL`              | No       | Logging verbosity                   | `info`        |
| `NODE_ENV`               | No       | Environment mode                    | `development` |
| `FOUNDRY_TIMEOUT`        | No       | Request timeout (ms)                | `10000`       |
| `FOUNDRY_RETRY_ATTEMPTS` | No       | Retry failed requests               | `3`           |
| `FOUNDRY_RETRY_DELAY`    | No       | Delay between retries (ms)          | `1000`        |
| `CACHE_ENABLED`          | No       | Enable response caching             | `true`        |
| `CACHE_TTL_SECONDS`      | No       | Cache duration (seconds)            | `300`         |
| `CACHE_MAX_SIZE`         | No       | Maximum cache entries               | -             |

### Tool Schemas

#### roll_dice

```json
{
  "formula": "1d20+5",
  "reason": "Attack roll against goblin"
}
```

#### search_world

```json
{
  "query": "dragon",
  "limit": 10
}
```

#### get_combat_state

```json
{}
```

#### search_actors

```json
{
  "query": "goblin",
  "type": "npc",
  "limit": 10
}
```

## Integration Examples

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "foundry": {
      "command": "node",
      "args": ["/path/to/foundry-mcp-server/dist/index.js"],
      "env": {
        "FOUNDRY_URL": "http://localhost:30000",
        "FOUNDRY_USERNAME": "your_username",
        "FOUNDRY_PASSWORD": "your_password"
      }
    }
  }
}
```

To enable optional diagnostics tools, add `FOUNDRY_API_KEY` to the `env` block:

```json
{
  "FOUNDRY_API_KEY": "your_api_key_here"
}
```

### Custom MCP Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["./dist/index.js"],
});

const client = new Client(
  {
    name: "foundry-client",
    version: "1.0.0",
  },
  {
    capabilities: {},
  },
);

await client.connect(transport);

// Roll dice
const result = await client.request({
  method: "tools/call",
  params: {
    name: "roll_dice",
    arguments: {
      formula: "1d20+5",
      reason: "Initiative roll",
    },
  },
});
```

## Roadmap

### Completed

- [x] Socket.IO authentication and world data loading
- [x] Combat state tracking
- [x] User awareness (online status)
- [x] Journal access and search
- [x] World-wide search across all entities
- [x] Chat message history
- [x] NPC and loot generation
- [x] Rule lookups
- [x] Write operations (create/update/delete actors, add items, create folders)
- [x] System-aware output (auto-detect game system, adapt tool descriptions and formatting)
- [x] System introspection (template schema, raw actor inspection, recipes)
- [x] The Expanse RPG system support

### Planned

- [ ] Pathfinder 2e system support
- [ ] Combat management (start/end combat, advance initiative)
- [ ] Token manipulation (move, update status effects)
- [ ] Scene navigation and switching
- [ ] Journal entry creation and editing
- [ ] Macro execution and management
- [ ] Multi-world support
- [ ] Docker deployment

## Documentation

Complete API documentation is available in the `docs/` directory, auto-generated from TypeScript source code and JSDoc comments.

### Viewing Documentation

**Local development:**

```bash
npm run docs        # Generate documentation
npm run docs:serve  # Generate and serve locally
```

**Online:** Browse the `docs/` folder in this repository or visit the GitHub Pages site (if enabled).

### What's Documented

- **FoundryClient API** - Complete client documentation with examples
- **TypeScript Interfaces** - All data structures and type definitions
- **Configuration** - Environment variables and setup options
- **Utilities** - Helper functions and logging
- **Usage Examples** - Code samples for common operations

The documentation is automatically updated via GitHub Actions when source code changes.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Write tests for new functionality
- Use meaningful commit messages

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Troubleshooting

### Quick Diagnostics
```bash
npm run test-connection      # Test FoundryVTT connectivity
npm run setup-wizard        # Re-run interactive setup
```

### Health Check
Use the `get_health_status` MCP tool for comprehensive diagnostics (requires REST API module), or check server logs during startup for detailed status information.

### Common Issues
- **Connection refused**: Ensure FoundryVTT is running with an active world on the configured port
- **Authentication failed**: Verify username/password match a FoundryVTT user exactly
- **Empty search results**: Ensure a world is active (not on setup screen) and the user has view permissions
- **World data not loading**: Check that Socket.IO authentication completed successfully

**Detailed troubleshooting guide**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Support

- **Issues**: GitHub Issues for bugs and feature requests
- **Discord**: [FoundryVTT Discord](https://discord.gg/foundryvtt) #api-development
- **Documentation**: [FoundryVTT API Docs](https://foundryvtt.com/api/)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Acknowledgments

- FoundryVTT team for the excellent VTT platform
- Anthropic for the Model Context Protocol
- The tabletop gaming community for inspiration and feedback
