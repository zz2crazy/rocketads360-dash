import { Logger } from './logger';
import type { DebugModule } from './config';

export const debug = {
  error: (module: DebugModule, message: string, error?: unknown) => 
    Logger.getInstance().error(module, message, error),
  warn: (module: DebugModule, message: string, data?: unknown) => 
    Logger.getInstance().warn(module, message, data),
  info: (module: DebugModule, message: string, data?: unknown) => 
    Logger.getInstance().info(module, message, data),
  debug: (module: DebugModule, message: string, data?: unknown) => 
    Logger.getInstance().debug(module, message, data),
  trace: (module: DebugModule, message: string, data?: unknown) => 
    Logger.getInstance().trace(module, message, data),
  group: (module: DebugModule, label: string) => 
    Logger.getInstance().group(module, label),
  groupEnd: (module: DebugModule) => 
    Logger.getInstance().groupEnd(module),
  table: (module: DebugModule, data: unknown[]) => 
    Logger.getInstance().table(module, data)
};

export { DEBUG_CONFIG } from './config';
export type { DebugLevel, DebugModule } from './config';