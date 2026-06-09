import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// Bake package.json version into the bundle so the shell's account dropdown
// can show a version/build tag without an env var. See src/config/app.ts.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    // Set base to '/<appname>/' for apps served at a subpath via Caddy handle_path.
    // Caddy strips the prefix, but the browser needs correct asset URLs.
    // Leave as '/' for apps served at the root domain.
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
        preact(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': { target: 'http://localhost:3000', changeOrigin: true },
            '/webhook': { target: 'http://localhost:3000', changeOrigin: true },
            '/health': { target: 'http://localhost:3000', changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
