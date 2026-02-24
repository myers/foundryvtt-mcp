/**
 * @fileoverview Item management tool handlers
 *
 * Handles searching for items and retrieving detailed item information.
 * Uses system-specific formatting when a SystemConfig is active,
 * falling back to generic D&D-style output otherwise.
 */

import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { FoundryClient } from '../../foundry/client.js';
import { getActiveSystemConfig } from '../../systems/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Handles item search requests
 */
export async function handleSearchItems(
  args: {
    query?: string;
    type?: string;
    rarity?: string;
    limit?: number;
  },
  foundryClient: FoundryClient,
) {
  const { query, type, rarity, limit = 10 } = args;

  try {
    logger.info('Searching items', { query, type, rarity, limit });
    const systemConfig = getActiveSystemConfig();

    // When a system config is active, format from raw world items
    if (systemConfig && foundryClient.hasWorldData()) {
      const worldData = foundryClient.getWorldData();
      if (!worldData) {
        throw new McpError(ErrorCode.InternalError, 'World data not available');
      }
      let results = worldData.items;

      if (query) {
        const q = query.toLowerCase();
        results = results.filter((i) => i.name.toLowerCase().includes(q));
      }
      if (type) {
        const t = type.toLowerCase();
        results = results.filter((i) => i.type.toLowerCase() === t);
      }

      const total = results.length;
      const sliced = results.slice(0, limit);
      const itemList = sliced.map((item) => systemConfig.formatItemSummary(item)).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `**Item Search Results** (${systemConfig.name})
**Query:** ${query || 'All items'}
**Type Filter:** ${type || 'All types'}
**Results:** ${sliced.length}/${total} total

${itemList || 'No items found matching the criteria.'}`,
          },
        ],
      };
    }

    // Fallback: generic formatting
    const searchParams: { query: string; type?: string; rarity?: string; limit: number } = {
      query: query || '',
      limit,
    };
    if (type) {
      searchParams.type = type;
    }
    if (rarity) {
      searchParams.rarity = rarity;
    }
    const result = await foundryClient.searchItems(searchParams);

    const itemList = result.items
      .map((item) => {
        const price = item.price
          ? `${item.price.value} ${item.price.denomination}`
          : 'Unknown price';
        return `- **${item.name}** (${item.type}) - ${item.rarity || 'Common'} - ${price}`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `**Item Search Results**
**Query:** ${query || 'All items'}
**Type Filter:** ${type || 'All types'}
**Rarity Filter:** ${rarity || 'All rarities'}
**Results:** ${result.items.length}/${result.total} total

${itemList || 'No items found matching the criteria.'}

**Page:** ${result.page} | **Limit:** ${result.limit}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to search items:', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search items: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
