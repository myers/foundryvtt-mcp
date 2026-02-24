/**
 * @fileoverview System introspection tool handlers.
 *
 * Provides get_system_template (Actor/Item templates + recipes) and
 * get_raw_actor (full JSON dump of an actor).
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { FoundryClient } from '../../foundry/client.js';
import { getActiveSystemConfig } from '../../systems/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Returns the Actor/Item template schema from worldData, enriched with
 * system config recipes and field guidance when available.
 */
export async function handleGetSystemTemplate(
  _args: Record<string, unknown>,
  foundryClient: FoundryClient,
) {
  try {
    const worldData = foundryClient.getWorldData();
    const systemConfig = getActiveSystemConfig();
    const lines: string[] = [];

    // System identification
    const systemId = worldData?.system
      ? (worldData.system as Record<string, unknown>).id
      : 'unknown';
    const systemTitle = systemConfig?.name ?? systemId;
    lines.push(`**System:** ${systemTitle}`);
    lines.push('');

    // Raw template data
    if (worldData?.template) {
      if (worldData.template.Actor) {
        lines.push('## Actor Template');
        lines.push('```json');
        lines.push(JSON.stringify(worldData.template.Actor, null, 2));
        lines.push('```');
        lines.push('');
      }
      if (worldData.template.Item) {
        lines.push('## Item Template');
        lines.push('```json');
        lines.push(JSON.stringify(worldData.template.Item, null, 2));
        lines.push('```');
        lines.push('');
      }
    } else {
      lines.push('*No template data available in worldData.*');
      lines.push('');
    }

    // System config enrichment
    if (systemConfig) {
      lines.push('## Actor Types');
      for (const at of systemConfig.actorTypes) {
        lines.push(`### ${at.label} (type: "${at.type}")`);
        lines.push(at.description);
        if (at.keyFields.length > 0) {
          lines.push('**Key fields:**');
          for (const f of at.keyFields) {
            const range = f.range ? ` (${f.range.min}–${f.range.max})` : '';
            lines.push(`- \`${f.path}\` — ${f.description} [${f.type}]${range}`);
          }
        }
        lines.push('');
      }

      lines.push('## Item Types');
      for (const it of systemConfig.itemTypes) {
        lines.push(`### ${it.label} (type: "${it.type}")`);
        lines.push(it.description);
        if (it.keyFields.length > 0) {
          lines.push('**Key fields:**');
          for (const f of it.keyFields) {
            lines.push(`- \`${f.path}\` — ${f.description} [${f.type}]`);
          }
        }
        lines.push('');
      }

      if (systemConfig.recipes.length > 0) {
        lines.push('## Recipes');
        for (const recipe of systemConfig.recipes) {
          lines.push(`### ${recipe.name}`);
          lines.push(recipe.description);
          for (const step of recipe.steps) {
            lines.push(step);
          }
          lines.push('');
        }
      }
    }

    return {
      content: [{ type: 'text', text: lines.join('\n') }],
    };
  } catch (error) {
    logger.error('Failed to get system template:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get system template: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Returns the full raw JSON of an actor from worldData.
 */
export async function handleGetRawActor(args: { actorId: string }, foundryClient: FoundryClient) {
  const { actorId } = args;

  if (!actorId || typeof actorId !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'actorId is required and must be a string');
  }

  try {
    const actor = foundryClient.getRawActor(actorId);
    if (!actor) {
      throw new McpError(ErrorCode.InvalidParams, `Actor not found: ${actorId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(actor, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    logger.error('Failed to get raw actor:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get raw actor: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
