import type { PropsWithChildren } from "react";

export function AppLink({
	to,
	className = "underline hover:text-orange-600",
	newWindow = false,
	children,
}: PropsWithChildren<{ to: string; className?: string; newWindow?: boolean }>) {
	return (
		<a
			href={to}
			className={className}
			target={newWindow ? "_blank" : undefined}
			rel={newWindow ? "noopener noreferrer" : undefined}
		>
			{children}
		</a>
	);
}
