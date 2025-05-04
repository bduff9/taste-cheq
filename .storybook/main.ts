import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";
import path from "node:path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: [
		"@storybook/addon-essentials",
		"@storybook/addon-links",
		"@storybook/addon-a11y",
	],
	framework: {
		name: "@storybook/experimental-nextjs-vite",
		options: {},
	},
	docs: {
		autodocs: "tag",
	},
	async viteFinal(config) {
		return mergeConfig(config, {
			resolve: {
				alias: {
					...(config.resolve?.alias || {}),
					pg: path.resolve(__dirname, "./__mocks__/empty.js"),
					"pg-cloudflare": path.resolve(__dirname, "./__mocks__/empty.js"),
					"node:crypto": path.resolve(__dirname, "./__mocks__/crypto.js"),
				},
			},
		});
	},
};
export default config;
