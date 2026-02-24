/**
 * Combat state tool handler
 *
 * Uses system-specific formatting when a SystemConfig is active,
 * falling back to generic HP/AC output otherwise.
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { FoundryClient } from '../../foundry/client.js';
import { getActiveSystemConfig } from '../../systems/index.js';
import { logger } from '../../utils/logger.js';

export async function handleGetCombatState(
  _args: Record<string, unknown>,
  foundryClient: FoundryClient,
) {
  try {
    const combat = foundryClient.getCombatState();

    if (!combat) {
      return {
        content: [{ type: 'text', text: 'No active combat encounter.' }],
      };
    }

    const systemConfig = getActiveSystemConfig();

    const combatants = combat.combatants
      .sort((a, b) => (b.initiative ?? -999) - (a.initiative ?? -999))
      .map((c, i) => {
        const current = combat.turn === i ? ' <-- CURRENT' : '';
        const actor = c.actorId ? foundryClient.getRawActor(c.actorId) : undefined;

        // System-specific formatting
        if (systemConfig) {
          const line = systemConfig.formatCombatant(c, actor ?? undefined);
          return `${i + 1}. ${line}${current}`;
        }

        // Fallback: generic HP/AC
        const status = c.defeated ? ' [DEFEATED]' : c.hidden ? ' [HIDDEN]' : '';
        const init = c.initiative !== null ? c.initiative.toString() : '?';

        let hpAc = '';
        if (actor) {
          const hp = actor.system?.attributes as Record<string, unknown> | undefined;
          const hpData = hp?.hp as { value?: number; max?: number } | undefined;
          const acData = hp?.ac as { value?: number } | undefined;
          if (hpData) {
            hpAc += ` HP: ${hpData.value ?? '?'}/${hpData.max ?? '?'}`;
          }
          if (acData) {
            hpAc += ` AC: ${acData.value ?? '?'}`;
          }
        }

        return `${i + 1}. [${init}] **${c.name}**${hpAc}${status}${current}`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `**Active Combat** — Round ${combat.round}\n\n${combatants}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get combat state:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get combat state: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
