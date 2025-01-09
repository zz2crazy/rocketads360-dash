# Debug Module

A flexible debugging system for the Order Management Platform that can be easily enabled/disabled without affecting production code.

## Features

- Multiple debug levels (error, warn, info, debug, trace)
- Module-specific debugging
- Colored console output
- Timestamp for all logs
- Group logging support
- Table formatting for data
- Easy to enable/disable via localStorage or environment

## Usage

```typescript
import { debug } from '@/lib/debug';

// Basic logging
debug.info('orders', 'Order created successfully', orderData);
debug.error('auth', 'Authentication failed', error);

// Grouped logging
debug.group('profile', 'Profile Update');
debug.debug('profile', 'Validating data...', data);
debug.info('profile', 'Data validated');
debug.groupEnd('profile');

// Table format
debug.table('orders', ordersList);
```

## Configuration

Debug mode can be enabled in two ways:
1. Development environment (automatically enabled)
2. localStorage.setItem('DEBUG', 'true')

Configure modules and levels in `config.ts`:
```typescript
export const DEBUG_CONFIG = {
  enabled: true,
  levels: {
    error: true,
    warn: true,
    info: true,
    debug: true,
    trace: false
  },
  modules: {
    auth: true,
    orders: true,
    profile: true,
    webhook: true,
    api: true
  }
};
```