import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	entry: ['src/index.ts', 'src/**/*.ts', '!src/lib/deploy.ts'],
	format: ['esm'],
	target: 'esnext',
	outDir: 'build',
	clean: true,
	bundle: false,
	splitting: false,
	minify: !options.watch,
	onSuccess: 'tsc-alias'
}));
