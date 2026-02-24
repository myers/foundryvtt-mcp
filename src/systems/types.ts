/**
 * @fileoverview System configuration types for per-system MCP behavior.
 *
 * Each supported game system provides a SystemConfig that describes
 * valid actor/item types, field paths, tool guidance, recipes, and
 * formatting functions.
 */

import type { WorldActor, WorldItem } from '../foundry/types.js';

export interface SystemConfig {
  /** System identifier matching worldData.system.id (e.g., "expanse") */
  id: string;
  /** Human-readable system name (e.g., "The Expanse RPG") */
  name: string;
  /** Valid actor types with field documentation */
  actorTypes: ActorTypeConfig[];
  /** Valid item types with field documentation */
  itemTypes: ItemTypeConfig[];
  /** Tool name → text appended to the tool's MCP description */
  toolGuidance: Record<string, string>;
  /** Step-by-step workflow recipes for common tasks */
  recipes: Recipe[];

  /** One-line summary for search result lists */
  formatActorSummary(actor: WorldActor): string;
  /** Full detail view for get_actor_details */
  formatActorDetails(actor: WorldActor): string;
  /** One-line summary for item search results */
  formatItemSummary(item: WorldItem): string;
  /** Combatant line for combat state display */
  formatCombatant(
    combatant: { name: string; initiative: number | null; defeated: boolean; hidden: boolean },
    actor?: WorldActor,
  ): string;
}

export interface ActorTypeConfig {
  type: string;
  label: string;
  description: string;
  keyFields: FieldDoc[];
}

export interface ItemTypeConfig {
  type: string;
  label: string;
  description: string;
  keyFields: FieldDoc[];
}

export interface FieldDoc {
  /** Dot-notation path from system root, e.g. "abilities.accuracy.rating" */
  path: string;
  description: string;
  type: 'number' | 'string' | 'boolean';
  range?: { min: number; max: number };
}

export interface Recipe {
  name: string;
  description: string;
  steps: string[];
}
