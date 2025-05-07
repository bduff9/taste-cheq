declare namespace JSX {
	interface IntrinsicElements {
		"gmpx-place-autocomplete": React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLElement>,
			HTMLElement
		> & {
			ref?: React.Ref<any>;
			placeholder?: string;
			types?: string;
		};
	}
}
