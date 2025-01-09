import { DEBUG_CONFIG, type DebugLevel, type DebugModule } from './config';

export class Logger {
  private static instance: Logger;
  private groupLevel: number = 0;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: DebugLevel, module: DebugModule): boolean {
    return DEBUG_CONFIG.enabled && 
           DEBUG_CONFIG.levels[level] && 
           DEBUG_CONFIG.modules[module];
  }

  private formatMessage(module: DebugModule, message: string): string {
    return `[${module.toUpperCase()}] ${message}`;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  error(module: DebugModule, message: string, error?: unknown): void {
    if (this.shouldLog('error', module)) {
      console.error(
        `%c${this.getTimestamp()} ${this.formatMessage(module, message)}`,
        'color: #ff4444',
        error
      );
    }
  }

  warn(module: DebugModule, message: string, data?: unknown): void {
    if (this.shouldLog('warn', module)) {
      console.warn(
        `%c${this.getTimestamp()} ${this.formatMessage(module, message)}`,
        'color: #ffbb33',
        data
      );
    }
  }

  info(module: DebugModule, message: string, data?: unknown): void {
    if (this.shouldLog('info', module)) {
      console.info(
        `%c${this.getTimestamp()} ${this.formatMessage(module, message)}`,
        'color: #33b5e5',
        data
      );
    }
  }

  debug(module: DebugModule, message: string, data?: unknown): void {
    if (this.shouldLog('debug', module)) {
      console.debug(
        `%c${this.getTimestamp()} ${this.formatMessage(module, message)}`,
        'color: #00c851',
        data
      );
    }
  }

  trace(module: DebugModule, message: string, data?: unknown): void {
    if (this.shouldLog('trace', module)) {
      console.trace(
        `%c${this.getTimestamp()} ${this.formatMessage(module, message)}`,
        'color: #aa66cc',
        data
      );
    }
  }

  group(module: DebugModule, label: string): void {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.modules[module]) {
      console.group(this.formatMessage(module, label));
      this.groupLevel++;
    }
  }

  groupEnd(module: DebugModule): void {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.modules[module] && this.groupLevel > 0) {
      console.groupEnd();
      this.groupLevel--;
    }
  }

  table(module: DebugModule, data: unknown[]): void {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.modules[module]) {
      console.table(data);
    }
  }
}