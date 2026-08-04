import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	entry: ['src/index.ts'],
	format: ['esm'],
	target: 'esnext',
	outDir: 'build',
	clean: true,
	minify: !options.watch
}));
