import type { PropsWithChildren } from "react";
import * as routes from "@/routes";
import { TOTAL_ATOMIC_COMPONENTS_COUNT } from "@/TOTAL_ATOMIC_COMPONENTS_COUNT";
import { AppLink } from "./AppLink";
import A from "./ExternalLink";

function FigureSearchForm({ className }: { className?: string }) {
	return <form className={className}>placeholder</form>;
}

export default function DictionaryLayout({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={`relative mx-auto flex min-h-screen  max-w-5xl flex-col gap-4 bg-white px-1 py-4 max-lg:px-2 ${
				className || ""
			}`}
		>
			<header className="flex flex-row flex-wrap  bg-slate-200 p-2 sm:gap-4">
				<h1 className="w-full self-center text-4xl font-bold text-slate-900 sm:w-auto sm:text-5xl">
					<AppLink to={routes.index()} className="">
						<span className=" text-gray-700">kanji</span>
						<span className=" text-blue-900">sense</span>
					</AppLink>
				</h1>
				<FigureSearchForm className="w-full grow self-center sm:w-auto" />
			</header>
			{children}
			<footer className=" bg-gray-50 p-8  sm:gap-4">
				<ul className=" flex flex-col flex-wrap justify-evenly gap-8 text-center md:flex-row md:gap-x-1 md:gap-y-8 md:text-left">
					<li className="basis-auto self-center  text-center text-sm text-slate-900 sm:w-auto md:basis-full">
						<AppLink
							to={routes.index()}
							className="py-3 font-bold no-underline"
						>
							<span className=" text-gray-700">kanji</span>
							<span className=" text-blue-900">sense</span>
						</AppLink>{" "}
						- Learn the kanji through{" "}
						<strong className="text-blue-800">components</strong> and{" "}
						<strong className="text-blue-800">connections</strong>.
					</li>
					<li className="">
						<AppLink
							to={routes.browseAtomicComponents()}
							className="py-3 text-gray-800 no-underline hover:text-orange-700  hover:underline md:p-4"
						>
							the {TOTAL_ATOMIC_COMPONENTS_COUNT} &quot;atomic&quot; components
						</AppLink>
					</li>
					<li className="">
						<AppLink
							to={routes.browseCharacters()}
							className="py-3 text-gray-800 no-underline hover:text-orange-700  hover:underline md:p-4"
						>
							the 3500 most important kanji
						</AppLink>
					</li>
					<li className="">
						<AppLink
							to={routes.browseSoundComponents()}
							className="py-3 text-gray-800 no-underline hover:text-orange-700  hover:underline md:p-4"
						>
							sound components
						</AppLink>
					</li>
					<li className="">
						<AppLink
							to={routes.about()}
							className="py-3 text-gray-800 no-underline hover:text-orange-700  hover:underline md:p-4"
						>
							about Kanjisense
						</AppLink>
					</li>
				</ul>
				<div className="mt-8 flex flex-col gap-2">
					<p className=" text-center text-sm text-black/40">
						<span className="">
							© 2026 Justin Silvestre{" "}
							<A href="https://whoisjust.in">www.whoisjust.in</A>
						</span>{" "}
					</p>
					<p className="text-center text-sm text-black/40">
						<A
							className=" no-underline hover:underline"
							href="https://www.whoisjust.in/imprint"
						>
							Impressum
						</A>
					</p>
				</div>
			</footer>
		</div>
	);
}
