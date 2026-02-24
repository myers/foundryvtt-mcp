/**
 * @fileoverview The Expanse RPG system configuration.
 *
 * Defines actor/item types, field documentation, tool guidance,
 * recipes, and formatting functions for the Expanse game system.
 */

import type { WorldActor, WorldItem } from '../foundry/types.js';
import type { SystemConfig } from './types.js';

// ---------------------------------------------------------------------------
// Helpers for safe nested access
// ---------------------------------------------------------------------------

function get(obj: Record<string, unknown>, ...keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur !== null && typeof cur === 'object' && !Array.isArray(cur)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return cur;
}

function num(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  const v = get(obj, ...keys);
  return typeof v === 'number' ? v : undefined;
}

function str(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  const v = get(obj, ...keys);
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ABILITIES = [
  'accuracy',
  'communication',
  'constitution',
  'dexterity',
  'fighting',
  'intelligence',
  'perception',
  'strength',
  'willpower',
] as const;

const ABILITY_ABBREV: Record<string, string> = {
  accuracy: 'ACC',
  communication: 'COM',
  constitution: 'CON',
  dexterity: 'DEX',
  fighting: 'FIG',
  intelligence: 'INT',
  perception: 'PER',
  strength: 'STR',
  willpower: 'WIL',
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatActorSummary(actor: WorldActor): string {
  const sys = actor.system;
  const parts: string[] = [`**${actor.name}** (${actor.type})`];

  // Show threat for NPCs
  const threat = str(sys, 'threat');
  if (threat) {
    parts.push(`Threat: ${threat}`);
  }

  // Key combat abilities
  const acc = num(sys, 'abilities', 'accuracy', 'rating');
  const fig = num(sys, 'abilities', 'fighting', 'rating');
  if (acc !== undefined || fig !== undefined) {
    parts.push(`ACC ${acc ?? '?'} / FIG ${fig ?? '?'}`);
  }

  // Defense & Toughness
  const def = num(sys, 'attributes', 'defense', 'value');
  const tough = num(sys, 'attributes', 'toughness', 'value');
  if (def !== undefined || tough !== undefined) {
    parts.push(`DEF ${def ?? '?'} / TOUGH ${tough ?? '?'}`);
  }

  return `- ${parts.join(' | ')}`;
}

function formatActorDetails(actor: WorldActor): string {
  const sys = actor.system;
  const lines: string[] = [];

  lines.push(`**${actor.name}**`);
  lines.push(`**Type:** ${actor.type}`);

  // Threat (NPCs)
  const threat = str(sys, 'threat');
  if (threat) {
    lines.push(`**Threat:** ${threat}`);
  }

  // Abilities
  lines.push('');
  lines.push('**Abilities:**');
  for (const ab of ABILITIES) {
    const rating = num(sys, 'abilities', ab, 'rating');
    const focus = get(sys, 'abilities', ab, 'focus');
    const focusStr =
      Array.isArray(focus) && focus.length > 0
        ? ` (Focus: ${focus.join(', ')})`
        : typeof focus === 'string' && focus.length > 0
          ? ` (Focus: ${focus})`
          : '';
    lines.push(`  ${ABILITY_ABBREV[ab]}: ${rating ?? '?'}${focusStr}`);
  }

  // Attributes
  lines.push('');
  const def = num(sys, 'attributes', 'defense', 'value');
  const tough = num(sys, 'attributes', 'toughness', 'value');
  const speed = num(sys, 'attributes', 'speed', 'value');
  const fortune = num(sys, 'attributes', 'fortune', 'value');
  const level = num(sys, 'attributes', 'level', 'value');
  lines.push('**Attributes:**');
  if (level !== undefined) {
    lines.push(`  Level: ${level}`);
  }
  if (def !== undefined) {
    lines.push(`  Defense: ${def}`);
  }
  if (tough !== undefined) {
    lines.push(`  Toughness: ${tough}`);
  }
  if (speed !== undefined) {
    lines.push(`  Speed: ${speed}`);
  }
  if (fortune !== undefined) {
    lines.push(`  Fortune: ${fortune}`);
  }

  // Info fields (plain strings, not {value: ...} objects)
  const origin = str(sys, 'info', 'origin');
  const socialClass = str(sys, 'info', 'social-class');
  const profession = str(sys, 'info', 'profession');
  const drive = str(sys, 'info', 'drive');
  if (origin || socialClass || profession || drive) {
    lines.push('');
    lines.push('**Background:**');
    if (origin) {
      lines.push(`  Origin: ${origin}`);
    }
    if (socialClass) {
      lines.push(`  Social Class: ${socialClass}`);
    }
    if (profession) {
      lines.push(`  Profession: ${profession}`);
    }
    if (drive) {
      lines.push(`  Drive: ${drive}`);
    }
  }

  // Bio (structured: bio.appearance, bio.relationships, bio.goals, bio.notes)
  const bioAppearance = str(sys, 'bio', 'appearance');
  const bioRelationships = str(sys, 'bio', 'relationships');
  const bioGoals = str(sys, 'bio', 'goals');
  const bioNotes = str(sys, 'bio', 'notes');
  if (bioAppearance || bioRelationships || bioGoals || bioNotes) {
    lines.push('');
    lines.push('**Bio:**');
    if (bioAppearance) {
      lines.push(
        `  Appearance: ${bioAppearance
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 200)}`,
      );
    }
    if (bioRelationships) {
      lines.push(
        `  Relationships: ${bioRelationships
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 200)}`,
      );
    }
    if (bioGoals) {
      lines.push(
        `  Goals: ${bioGoals
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 200)}`,
      );
    }
    if (bioNotes) {
      lines.push(
        `  Notes: ${bioNotes
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 200)}`,
      );
    }
  }

  // Conditions (character uses {active: boolean})
  const conditions = get(sys, 'conditions');
  if (conditions && typeof conditions === 'object' && !Array.isArray(conditions)) {
    const condEntries = Object.entries(conditions as Record<string, unknown>)
      .filter(([_k, v]) => {
        if (typeof v === 'object' && v !== null) {
          const rec = v as Record<string, unknown>;
          // Character conditions use {active: true/false}
          if (typeof rec.active === 'boolean') {
            return rec.active;
          }
          // Fallback: check .value
          const val = rec.value;
          return typeof val === 'boolean' ? val : typeof val === 'number' ? val > 0 : false;
        }
        return false;
      })
      .map(([k]) => k);
    if (condEntries.length > 0) {
      lines.push('');
      lines.push(`**Conditions:** ${condEntries.join(', ')}`);
    }
  }

  // Embedded items
  if (actor.items && actor.items.length > 0) {
    lines.push('');
    lines.push('**Items:**');
    for (const item of actor.items) {
      lines.push(`  - ${item.name} (${item.type})`);
    }
  }

  return lines.join('\n');
}

function formatItemSummary(item: WorldItem): string {
  const sys = item.system;
  const parts: string[] = [`**${item.name}** (${item.type})`];

  switch (item.type) {
    case 'weapon': {
      const atk = num(sys, 'attack') ?? str(sys, 'attack');
      const dmg = str(sys, 'damage') ?? num(sys, 'damage');
      if (atk !== undefined) {
        parts.push(`ATK: ${atk}`);
      }
      if (dmg !== undefined) {
        parts.push(`DMG: ${dmg}`);
      }
      break;
    }
    case 'armor': {
      const bonus = num(sys, 'bonus');
      const penalty = num(sys, 'penalty');
      if (bonus !== undefined) {
        parts.push(`Bonus: ${bonus}`);
      }
      if (penalty !== undefined) {
        parts.push(`Penalty: ${penalty}`);
      }
      break;
    }
    case 'talent': {
      const activeRank = str(sys, 'activeRank') ?? str(sys, 'rank');
      if (activeRank) {
        parts.push(`Rank: ${activeRank}`);
      }
      break;
    }
    case 'shield': {
      const bonus = num(sys, 'bonus');
      if (bonus !== undefined) {
        parts.push(`Bonus: ${bonus}`);
      }
      break;
    }
    default: {
      const desc = str(sys, 'description');
      if (desc) {
        const plain = desc.replace(/<[^>]*>/g, '').trim();
        if (plain) {
          parts.push(plain.slice(0, 80));
        }
      }
    }
  }

  return `- ${parts.join(' | ')}`;
}

function formatCombatant(
  combatant: { name: string; initiative: number | null; defeated: boolean; hidden: boolean },
  actor?: WorldActor,
): string {
  const init = combatant.initiative !== null ? combatant.initiative.toString() : '?';
  const status = combatant.defeated ? ' [DEFEATED]' : combatant.hidden ? ' [HIDDEN]' : '';

  let stats = '';
  if (actor) {
    const sys = actor.system;
    const def = num(sys, 'attributes', 'defense', 'value');
    const tough = num(sys, 'attributes', 'toughness', 'value');
    if (def !== undefined) {
      stats += ` DEF: ${def}`;
    }
    if (tough !== undefined) {
      stats += ` TOUGH: ${tough}`;
    }
  }

  return `[${init}] **${combatant.name}**${stats}${status}`;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const expanseConfig: SystemConfig = {
  id: 'expanse',
  name: 'The Expanse RPG',

  actorTypes: [
    {
      type: 'character',
      label: 'Character',
      description:
        'Player character or major NPC with full ability scores, backgrounds, and items.',
      keyFields: [
        ...ABILITIES.map((ab) => ({
          path: `abilities.${ab}.rating`,
          description: `${ABILITY_ABBREV[ab]} ability rating`,
          type: 'number' as const,
          range: { min: -2, max: 4 },
        })),
        {
          path: 'attributes.level.value',
          description: 'Character level',
          type: 'number' as const,
        },
        {
          path: 'attributes.speed.value',
          description: 'Speed (default 10)',
          type: 'number' as const,
        },
        {
          path: 'attributes.defense.value',
          description: 'Defense (10 + DEX)',
          type: 'number' as const,
        },
        {
          path: 'attributes.toughness.value',
          description: 'Toughness (CON-based)',
          type: 'number' as const,
        },
        {
          path: 'attributes.fortune.value',
          description: 'Fortune points',
          type: 'number' as const,
        },
        { path: 'info.origin', description: 'Character origin', type: 'string' as const },
        { path: 'info.social-class', description: 'Social class', type: 'string' as const },
        { path: 'info.profession', description: 'Profession', type: 'string' as const },
        { path: 'info.drive', description: 'Drive', type: 'string' as const },
      ],
    },
    {
      type: 'npc',
      label: 'NPC',
      description:
        'Non-player character with abilities, focuses, threat level, stunts, and talents.',
      keyFields: [
        ...ABILITIES.map((ab) => ({
          path: `abilities.${ab}.rating`,
          description: `${ABILITY_ABBREV[ab]} ability rating`,
          type: 'number' as const,
          range: { min: -2, max: 4 },
        })),
        {
          path: 'threat',
          description: 'Threat level (minor, moderate, major, dire)',
          type: 'string' as const,
        },
        {
          path: 'attributes.defense.value',
          description: 'Defense',
          type: 'number' as const,
        },
        {
          path: 'attributes.toughness.value',
          description: 'Toughness',
          type: 'number' as const,
        },
        { path: 'attributes.speed.value', description: 'Speed', type: 'number' as const },
      ],
    },
    {
      type: 'ship',
      label: 'Spaceship',
      description: 'Spacecraft with crew, weapons, hull, and losses.',
      keyFields: [
        { path: 'crew', description: 'Crew complement', type: 'number' as const },
        { path: 'weapons', description: 'Ship weapons', type: 'string' as const },
        { path: 'losses', description: 'Hull losses', type: 'number' as const },
      ],
    },
  ],

  itemTypes: [
    {
      type: 'weapon',
      label: 'Weapon',
      description: 'Melee or ranged weapon with attack and damage.',
      keyFields: [
        { path: 'attack', description: 'Attack ability or bonus', type: 'string' as const },
        { path: 'damage', description: 'Damage formula or value', type: 'string' as const },
      ],
    },
    {
      type: 'armor',
      label: 'Armor',
      description: 'Protective armor with bonus and penalty.',
      keyFields: [
        { path: 'bonus', description: 'Armor bonus', type: 'number' as const },
        { path: 'penalty', description: 'Armor penalty', type: 'number' as const },
      ],
    },
    {
      type: 'talent',
      label: 'Talent',
      description: 'Character talent with up to 3 ranks (novice, expert, master).',
      keyFields: [
        { path: 'activeRank', description: 'Currently active rank', type: 'string' as const },
      ],
    },
    {
      type: 'focus',
      label: 'Focus',
      description: 'Ability focus granting +2 to related tests.',
      keyFields: [],
    },
    {
      type: 'stunt',
      label: 'Stunt',
      description: 'Special combat or social stunt.',
      keyFields: [],
    },
    {
      type: 'shield',
      label: 'Shield',
      description: 'Shield providing a defense bonus.',
      keyFields: [
        { path: 'bonus', description: 'Shield bonus to Defense', type: 'number' as const },
      ],
    },
  ],

  toolGuidance: {
    create_actor:
      '\n\n**EXPANSE SYSTEM:** Valid actor types: "character", "npc", "ship". ' +
      'Abilities use `.rating` not `.value`: e.g. `"abilities.accuracy.rating": 2`. ' +
      'All 9 abilities: accuracy, communication, constitution, dexterity, fighting, intelligence, perception, strength, willpower (range -2 to 4). ' +
      'Other key fields: "attributes.level.value", "attributes.speed.value", "attributes.defense.value", "attributes.toughness.value", "attributes.fortune.value". ' +
      'NPC-specific: "threat" (minor/moderate/major/dire). ' +
      'Use `get_system_template` to see the full schema.',

    update_actor:
      '\n\n**EXPANSE SYSTEM:** Ability ratings use `.rating` not `.value`: e.g. `"system.abilities.accuracy.rating": 3`. ' +
      'Defense: "system.attributes.defense.value", Toughness: "system.attributes.toughness.value".',

    search_actors:
      '\n\n**EXPANSE SYSTEM:** Actor types are "character", "npc", and "ship". ' +
      'Results show DEF/TOUGH instead of HP/AC.',

    search_items:
      '\n\n**EXPANSE SYSTEM:** Item types: weapon, armor, talent, focus, stunt, shield. ' +
      'Weapons show ATK/DMG. Armor shows bonus/penalty. Talents show active rank.',

    add_actor_items:
      '\n\n**EXPANSE SYSTEM:** Common item types: "weapon", "armor", "talent", "focus", "stunt", "shield". ' +
      'Weapon system data: {attack: "accuracy", damage: "1d6+2"}. ' +
      'Talent system data: {activeRank: "novice"}.',

    get_combat_state: '\n\n**EXPANSE SYSTEM:** Shows Defense and Toughness instead of HP/AC.',

    generate_npc:
      '\n\n**EXPANSE SYSTEM:** This tool generates D&D-style NPCs. For Expanse NPCs, use `create_actor` with type "npc" instead. ' +
      'Call `get_system_template` first for the correct field schema.',
  },

  recipes: [
    {
      name: 'Create an Expanse NPC',
      description: 'Step-by-step workflow for creating a complete Expanse NPC.',
      steps: [
        '1. Call `get_system_template` to review the NPC actor schema.',
        '2. Call `create_actor` with type "npc", setting all 9 ability ratings via "abilities.<name>.rating" and "threat" level.',
        '3. Set "attributes.defense.value" (10 + DEX rating) and "attributes.toughness.value" (CON-based).',
        '4. Set "attributes.speed.value" (default 10 + DEX if appropriate).',
        '5. Call `add_actor_items` to add weapons, armor, talents, focuses, and stunts.',
        '6. Verify with `get_actor_details` to confirm all fields are correct.',
      ],
    },
    {
      name: 'Create an Expanse PC',
      description: 'Step-by-step workflow for creating a player character.',
      steps: [
        '1. Call `get_system_template` to review the character actor schema.',
        '2. Call `create_actor` with type "character", setting all 9 ability ratings.',
        '3. Set background info: "info.origin", "info.social-class", "info.profession", "info.drive" (plain strings, not .value).',
        '4. Set derived stats: "attributes.defense.value", "attributes.toughness.value", "attributes.speed.value", "attributes.fortune.value".',
        '5. Call `add_actor_items` to add talents, focuses, weapons, armor, and equipment.',
        '6. Verify with `get_actor_details` to confirm the character sheet.',
      ],
    },
  ],

  formatActorSummary,
  formatActorDetails,
  formatItemSummary,
  formatCombatant,
};
