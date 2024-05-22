import React from "react";
import { MDXProvider } from "@mdx-js/tag";

// components is its own object outside of render so that the references to
// components are stable
const components = {
	pre: (preProps) => {
		return <pre {...preProps} />;
	},
};
export const wrapRootElement = ({ element }) => (
	<MDXProvider components={components}>{element}</MDXProvider>
);
