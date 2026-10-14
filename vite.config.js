import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import createAuthPlugin from './server/auth-plugin.js';
import createApiPlugin from './server/api-plugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authPlugin=createAuthPlugin(env);
  return {
    plugins: [react(), authPlugin, createApiPlugin({authPlugin,env})],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: env.VITE_AUTH_API_BASE?.startsWith('http') ? { '/api': { target: env.VITE_AUTH_API_BASE, changeOrigin: true } } : undefined,
    },
  };
});
