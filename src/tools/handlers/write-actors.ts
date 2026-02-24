/**
 * @fileoverview Write operation handlers for actors, items, and folders.
 *
 * These handlers create, update, and delete documents in FoundryVTT
 * via the Socket.IO modifyDocument protocol.
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { FoundryClient } from '../../foundry/client.js';
import { logger } from '../../utils/logger.js';

/**
 * Expands dot-notation keys into nested objects.
 *
 * Example: { "abilities.accuracy.value": 3 }
 *       → { abilities: { accuracy: { value: 3 } } }
 */
export function expandDotNotation(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]!] = value;
  }

  return result;
}

/**
 * Create a new actor in the world.
 */
export async function handleCreateActor(
  args: {
    name: string;
    type: string;
    systemData?: Record<string, unknown>;
    items?: Array<{ name: string; type: string; system?: Record<string, unknown> }>;
    img?: string;
    folder?: string;
  },
  foundryClient: FoundryClient,
) {
  const { name, type, systemData, items, img, folder } = args;

  if (!name || typeof name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'name is required and must be a string');
  }
  if (!type || typeof type !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'type is required and must be a string');
  }

  try {
    logger.info('Creating actor', { name, type });

    const createData: {
      name: string;
      type: string;
      system?: Record<string, unknown>;
      items?: Array<Record<string, unknown>>;
      img?: string;
      folder?: string;
    } = { name, type };

    if (systemData) createData.system = expandDotNotation(systemData);
    if (items) createData.items = items as Array<Record<string, unknown>>;
    if (img) createData.img = img;
    if (folder) createData.folder = folder;

    const actor = await foundryClient.createActor(createData);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Actor created successfully.\n\n**ID:** ${actor._id}\n**Name:** ${actor.name}\n**Type:** ${actor.type}${actor.items?.length ? `\n**Embedded Items:** ${actor.items.length}` : ''}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to create actor:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create actor: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Update fields on an existing actor.
 */
export async function handleUpdateActor(
  args: {
    actorId: string;
    updates: Record<string, unknown>;
  },
  foundryClient: FoundryClient,
) {
  const { actorId, updates } = args;

  if (!actorId || typeof actorId !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'actorId is required and must be a string');
  }
  if (!updates || typeof updates !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, 'updates is required and must be an object');
  }

  try {
    logger.info('Updating actor', { actorId });

    const expanded = expandDotNotation(updates);
    const actor = await foundryClient.updateActor(actorId, expanded);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Actor updated successfully.\n\n**ID:** ${actor._id}\n**Name:** ${actor.name}\n**Type:** ${actor.type}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to update actor:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to update actor: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Delete an actor by ID.
 */
export async function handleDeleteActor(
  args: {
    actorId: string;
  },
  foundryClient: FoundryClient,
) {
  const { actorId } = args;

  if (!actorId || typeof actorId !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'actorId is required and must be a string');
  }

  try {
    // Verify actor exists before deleting
    const worldData = foundryClient.getWorldData();
    const existing = worldData?.actors.find((a) => a._id === actorId);
    if (!existing) {
      throw new McpError(ErrorCode.InvalidParams, `Actor not found: ${actorId}`);
    }

    logger.info('Deleting actor', { actorId, name: existing.name });

    await foundryClient.deleteActor(actorId);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Actor deleted successfully.\n\n**Deleted:** ${existing.name} (${actorId})`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) throw error;
    logger.error('Failed to delete actor:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to delete actor: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Add embedded items to an existing actor.
 */
export async function handleAddActorItems(
  args: {
    actorId: string;
    items: Array<{ name: string; type: string; system?: Record<string, unknown> }>;
  },
  foundryClient: FoundryClient,
) {
  const { actorId, items } = args;

  if (!actorId || typeof actorId !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'actorId is required and must be a string');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new McpError(ErrorCode.InvalidParams, 'items must be a non-empty array');
  }

  try {
    logger.info('Adding items to actor', { actorId, count: items.length });

    const created = await foundryClient.createEmbeddedItems(
      actorId,
      items as Array<Record<string, unknown>>,
    );

    const itemList = created.map((i) => `- **${i.name}** (${i.type})`).join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `Added ${created.length} item(s) to actor.\n\n**Actor ID:** ${actorId}\n**Items added:**\n${itemList}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to add items to actor:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to add items to actor: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Create an organizational folder.
 */
export async function handleCreateFolder(
  args: {
    name: string;
    type: string;
    parent?: string;
  },
  foundryClient: FoundryClient,
) {
  const { name, type, parent } = args;

  if (!name || typeof name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'name is required and must be a string');
  }
  if (!type || typeof type !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'type is required and must be a string');
  }

  try {
    logger.info('Creating folder', { name, type });

    const folderData: { name: string; type: string; parent?: string } = { name, type };
    if (parent) folderData.parent = parent;

    const folder = await foundryClient.createFolder(folderData);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Folder created successfully.\n\n**ID:** ${folder._id}\n**Name:** ${folder.name}\n**Type:** ${folder.type}${folder.parent ? `\n**Parent:** ${folder.parent}` : ''}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to create folder:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
