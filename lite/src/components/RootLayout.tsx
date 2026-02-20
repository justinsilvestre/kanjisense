import type { PropsWithChildren } from "react";

export function RootLayout({
	title,
	children,
}: PropsWithChildren<{ title: string }>) {
	return (
		<html lang="en" className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<title>{title}</title>
				<link rel="stylesheet" href="/static/style.css" />
			</head>
			<body className="relative min-h-full">
				{children}
				<div
					id="overlay"
					className="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-10 h-full w-full overflow-hidden"
				></div>
			</body>
		</html>
	);
}
