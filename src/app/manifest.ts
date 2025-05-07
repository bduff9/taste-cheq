import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "TasteCheq",
		short_name: "TasteCheq",
		description: "Scan, record, and rate menu items from anywhere.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#2050a0", // TasteCheq blue
		icons: [
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/apple-icon.png",
				sizes: "180x180",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
