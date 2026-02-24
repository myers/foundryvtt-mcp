/**
 * @fileoverview Tool definitions for FoundryVTT MCP Server
 *
 * This module contains all tool schema definitions organized by category.
 * Tools are separated into logical groups for better maintainability.
 */

import { getActiveSystemConfig } from '../systems/index.js';

/**
 * Dice rolling tool definitions
 */
export const diceTools = [
  {
    name: 'roll_dice',
    description: 'Roll dice using standard RPG notation (e.g., 1d20, 3d6+4)',
    inputSchema: {
      type: 'object',
      properties: {
        formula: {
          type: 'string',
          description: 'Dice formula (e.g., "1d20+5", "3d6")',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for the roll',
        },
      },
      required: ['formula'],
    },
  },
];

/**
 * Actor management tool definitions
 */
export const actorTools = [
  {
    name: 'search_actors',
    description: 'Search for actors (characters, NPCs) in FoundryVTT',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for actor names',
        },
        type: {
          type: 'string',
          description: 'Actor type filter (character, npc, etc.)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_actor_details',
    description: 'Get detailed information about a specific actor',
    inputSchema: {
      type: 'object',
      properties: {
        actorId: {
          type: 'string',
          description: 'The ID of the actor to retrieve',
        },
      },
      required: ['actorId'],
    },
  },
];

/**
 * Item management tool definitions
 */
export const itemTools = [
  {
    name: 'search_items',
    description: 'Search for items in FoundryVTT',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for item names',
        },
        type: {
          type: 'string',
          description: 'Item type filter (weapon, armor, consumable, etc.)',
        },
        rarity: {
          type: 'string',
          description: 'Item rarity filter (common, uncommon, rare, etc.)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 10,
        },
      },
    },
  },
];

/**
 * Scene management tool definitions
 */
export const sceneTools = [
  {
    name: 'get_scene_info',
    description: 'Get information about the current or specified scene',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: {
          type: 'string',
          description: 'Optional scene ID. If not provided, returns current scene',
        },
      },
    },
  },
];

/**
 * Content generation tool definitions
 */
export const generationTools = [
  {
    name: 'generate_npc',
    description: 'Generate a random NPC with stats and background',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'number',
          description: 'Character level (1-20)',
          minimum: 1,
          maximum: 20,
          default: 1,
        },
        race: {
          type: 'string',
          description: 'Character race (optional)',
        },
        class: {
          type: 'string',
          description: 'Character class (optional)',
        },
      },
    },
  },
  {
    name: 'generate_loot',
    description: 'Generate random loot for encounters',
    inputSchema: {
      type: 'object',
      properties: {
        challengeRating: {
          type: 'number',
          description: 'Challenge rating for loot generation',
          minimum: 0,
          maximum: 30,
        },
        treasureType: {
          type: 'string',
          description: 'Type of treasure (hoard, individual, etc.)',
        },
      },
    },
  },
  {
    name: 'lookup_rule',
    description: 'Look up game rules and mechanics',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Rule or mechanic to look up',
        },
        system: {
          type: 'string',
          description: 'Game system (D&D 5e, Pathfinder, etc.)',
        },
      },
      required: ['query'],
    },
  },
];

/**
 * Diagnostics and logging tool definitions
 */
export const diagnosticsTools = [
  {
    name: 'get_recent_logs',
    description: 'Get recent log entries from FoundryVTT',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of log entries to retrieve',
          default: 20,
          minimum: 1,
          maximum: 100,
        },
        level: {
          type: 'string',
          description: 'Log level filter (debug, info, warn, error)',
          enum: ['debug', 'info', 'warn', 'error'],
        },
        since: {
          type: 'string',
          description: 'Get logs since this timestamp (ISO format)',
        },
      },
    },
  },
  {
    name: 'search_logs',
    description: 'Search through FoundryVTT logs',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for log contents',
        },
        level: {
          type: 'string',
          description: 'Log level filter',
          enum: ['debug', 'info', 'warn', 'error'],
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 50,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_system_health',
    description: 'Get system health and performance metrics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'diagnose_errors',
    description: 'Diagnose and analyze system errors',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Error category to focus on',
        },
      },
    },
  },
  {
    name: 'get_health_status',
    description: 'Get comprehensive health status of FoundryVTT server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Combat tool definitions
 */
export const combatTools = [
  {
    name: 'get_combat_state',
    description: 'Get the current active combat state including initiative order, HP, and AC',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Chat message tool definitions
 */
export const chatTools = [
  {
    name: 'get_chat_messages',
    description: 'Get recent chat messages from the game',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of messages to retrieve (default 20)',
          default: 20,
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
];

/**
 * User tool definitions
 */
export const userTools = [
  {
    name: 'get_users',
    description: 'Get the list of users with their online status and roles',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Journal tool definitions
 */
export const journalTools = [
  {
    name: 'search_journals',
    description: 'Search journal entries by name or content',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for journal names and content',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_journal',
    description: 'Get a specific journal entry with its pages',
    inputSchema: {
      type: 'object',
      properties: {
        journalId: {
          type: 'string',
          description: 'The ID of the journal entry to retrieve',
        },
      },
      required: ['journalId'],
    },
  },
];

/**
 * World-level tool definitions
 */
export const worldTools = [
  {
    name: 'search_world',
    description: 'Search across all collections (actors, items, scenes, journals) by name',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to match against entity names',
        },
        limit: {
          type: 'number',
          description: 'Maximum results per collection (default 5)',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_world_summary',
    description: 'Get world metadata and collection counts',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'refresh_world_data',
    description: 'Force re-fetch of world data from the FoundryVTT server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Write operation tool definitions
 */
export const writeTools = [
  {
    name: 'create_actor',
    description:
      'Create a new actor (character/NPC) in the FoundryVTT world. ' +
      'For the Expanse system: type is typically "character". ' +
      'Use systemData with dot-notation keys for abilities (e.g., "abilities.accuracy.value": 1). ' +
      'Expanse abilities: accuracy, communication, constitution, dexterity, fighting, intelligence, perception, strength, willpower (range -2 to 4). ' +
      'Other system fields include "info.level.value", "info.speed.value", "info.defense.value", "attributes.toughness.value", "conditions.fortune.value".',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Actor name',
        },
        type: {
          type: 'string',
          description: 'Actor type (e.g., "character")',
        },
        systemData: {
          type: 'object',
          description:
            'System-specific data using dot-notation keys (e.g., {"abilities.accuracy.value": 2}). Keys are expanded to nested objects before sending.',
          additionalProperties: true,
        },
        items: {
          type: 'array',
          description: 'Embedded items to create on the actor (weapons, talents, etc.)',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              system: {
                type: 'object',
                additionalProperties: true,
              },
            },
            required: ['name', 'type'],
          },
        },
        img: {
          type: 'string',
          description: 'Token/avatar image path',
        },
        folder: {
          type: 'string',
          description: 'Folder ID to place actor in',
        },
      },
      required: ['name', 'type'],
    },
  },
  {
    name: 'update_actor',
    description:
      'Update fields on an existing actor. Use dot-notation keys in the updates object ' +
      '(e.g., {"abilities.accuracy.value": 3, "name": "New Name"}). ' +
      'Keys are expanded to nested objects before sending to Foundry.',
    inputSchema: {
      type: 'object',
      properties: {
        actorId: {
          type: 'string',
          description: 'The ID of the actor to update',
        },
        updates: {
          type: 'object',
          description: 'Fields to update, using dot-notation for nested paths',
          additionalProperties: true,
        },
      },
      required: ['actorId', 'updates'],
    },
  },
  {
    name: 'delete_actor',
    description: 'Delete an actor from the world by ID. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        actorId: {
          type: 'string',
          description: 'The ID of the actor to delete',
        },
      },
      required: ['actorId'],
    },
  },
  {
    name: 'add_actor_items',
    description:
      'Add embedded items (weapons, talents, abilities, equipment) to an existing actor. ' +
      'Each item needs a name, type, and optional system data.',
    inputSchema: {
      type: 'object',
      properties: {
        actorId: {
          type: 'string',
          description: 'The ID of the actor to add items to',
        },
        items: {
          type: 'array',
          description: 'Array of items to add',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Item name' },
              type: {
                type: 'string',
                description: 'Item type (e.g., "weapon", "talent", "stunt")',
              },
              system: {
                type: 'object',
                description: 'System-specific item data',
                additionalProperties: true,
              },
            },
            required: ['name', 'type'],
          },
        },
      },
      required: ['actorId', 'items'],
    },
  },
  {
    name: 'create_folder',
    description:
      'Create an organizational folder in FoundryVTT. ' +
      'Folders can contain Actors, Items, JournalEntry, RollTable, Scene, or Playlist documents.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Folder name',
        },
        type: {
          type: 'string',
          description:
            'Document type this folder contains (Actor, Item, JournalEntry, Scene, etc.)',
          enum: ['Actor', 'Item', 'JournalEntry', 'RollTable', 'Scene', 'Playlist'],
        },
        parent: {
          type: 'string',
          description: 'Parent folder ID for nesting (optional)',
        },
      },
      required: ['name', 'type'],
    },
  },
];

/**
 * System introspection tool definitions
 */
export const systemTools = [
  {
    name: 'get_system_template',
    description:
      'Get the Actor/Item template schema for the connected game system, including valid types, ' +
      'field paths, and step-by-step recipes for creating characters and NPCs.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_raw_actor',
    description:
      'Get the full raw JSON of an actor from world data, including all system-specific fields. ' +
      'Useful for inspecting the exact data shape of a specific actor.',
    inputSchema: {
      type: 'object',
      properties: {
        actorId: {
          type: 'string',
          description: 'The ID of the actor to retrieve',
        },
      },
      required: ['actorId'],
    },
  },
];

/**
 * Get all tool definitions combined
 */
export function getAllTools() {
  return [
    ...diceTools,
    ...actorTools,
    ...itemTools,
    ...sceneTools,
    ...combatTools,
    ...chatTools,
    ...userTools,
    ...journalTools,
    ...worldTools,
    ...generationTools,
    ...diagnosticsTools,
    ...writeTools,
    ...systemTools,
  ];
}

/**
 * Returns all tools with system-specific guidance appended to descriptions.
 * Falls back to base descriptions when no system config is active.
 */
export function getEnrichedTools() {
  const tools = getAllTools();
  const systemConfig = getActiveSystemConfig();

  if (!systemConfig) {
    return tools;
  }

  return tools.map((tool) => {
    const guidance = systemConfig.toolGuidance[tool.name];
    if (!guidance) {
      return tool;
    }

    return {
      ...tool,
      description: tool.description + guidance,
    };
  });
}

/**
 * Get modernized tool definitions from registry (when available)
 */
export async function getModernizedTools() {
  try {
    const { toolRegistry } = await import('./registry.js');
    const modernTools = toolRegistry.getToolDefinitions();

    // Filter out tools that have been modernized to avoid duplicates
    const modernToolNames = new Set(modernTools.map((tool) => tool.name));
    const legacyTools = getAllTools().filter((tool) => !modernToolNames.has(tool.name));

    return [...modernTools, ...legacyTools];
  } catch (_error) {
    // Fallback to legacy definitions if registry is not available
    return getAllTools();
  }
}
