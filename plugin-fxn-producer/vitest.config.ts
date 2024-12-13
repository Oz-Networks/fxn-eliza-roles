import { defineConfig } from 'vitest/config';
// Use this import syntax instead
const path = require('path');

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
