export const DEBUG_CONFIG = {
  enabled: false,
  levels: {
    error: true,
    warn: true,
    info: true,
    debug: true,
    trace: true
  },
  modules: {
    auth: false,
    orders: false,
    profile: false,
    webhook: false,
    api: false
  }
} as const;

export type DebugLevel = keyof typeof DEBUG_CONFIG.levels;