/**
 * @fileoverview System config registry.
 *
 * Resolves a worldData.system.id to a SystemConfig and manages the
 * active singleton for the current session.
 */

import { logger } from '../utils/logger.js';
import { expanseConfig } from './expanse.js';
import type { SystemConfig } from './types.js';

/** Map of system id → config. Add new systems here. */
const systemConfigs: Record<string, SystemConfig> = {
  expanse: expanseConfig,
};

let activeConfig: SystemConfig | null = null;

/**
 * Looks up and activates the SystemConfig for the given system id.
 * Returns the config if found, null otherwise.
 */
export function resolveSystemConfig(systemId: string): SystemConfig | null {
  const config = systemConfigs[systemId] ?? null;
  activeConfig = config;

  if (config) {
    logger.info(`System config activated: ${config.name} (${config.id})`);
  } else {
    logger.info(`No system config for "${systemId}" — using generic defaults`);
  }

  return config;
}

/** Returns the currently active system config, or null. */
export function getActiveSystemConfig(): SystemConfig | null {
  return activeConfig;
}

/** Resets the active config (for tests). */
export function resetSystemConfig(): void {
  activeConfig = null;
}
