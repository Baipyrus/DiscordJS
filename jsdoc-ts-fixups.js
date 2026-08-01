export const handlers = {
	beforeParse(e) {
		// Replace ReturnType<typeof X> and similar typeof-operator
		// usages with something catharsis can actually parse.
		e.source = e.source.replace(/ReturnType<typeof [^>]+>/g, '*');
	}
};
