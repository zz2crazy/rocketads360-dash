export const DEBUG_CONFIG = {
  enabled: true,
  levels: {
    error: true,
    warn: true,
    info: true,
    debug: true,
    trace: true
  },
  modules: {
    auth: true,
    orders: true,
    profile: true,
    webhook: true,
    api: true,
    supabase: true,
    login: true
  }
} as const;

export type DebugLevel = keyof typeof DEBUG_CONFIG.levels;
export type DebugModule = keyof typeof DEBUG_CONFIG.modules;