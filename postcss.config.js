const isStorybook = !!process.env.STORYBOOK;

module.exports = {
	plugins: isStorybook
		? [require("@tailwindcss/postcss"), require("autoprefixer")]
		: ["@tailwindcss/postcss", "autoprefixer"],
};
