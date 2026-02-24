/**
 * @fileoverview Systems module re-exports.
 */

export { expanseConfig } from './expanse.js';

export {
  getActiveSystemConfig,
  resetSystemConfig,
  resolveSystemConfig,
} from './registry.js';
export type {
  ActorTypeConfig,
  FieldDoc,
  ItemTypeConfig,
  Recipe,
  SystemConfig,
} from './types.js';
