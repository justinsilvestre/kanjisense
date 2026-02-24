import DictionaryLayout from "@/components/DictionaryLayout";
import { RootLayout } from "@/components/RootLayout";
import type { DictKanjisenseFigure } from "@/db/kanjisenseFigure";

export function DictPage({ figure }: { figure: DictKanjisenseFigure }) {
	return (
		<RootLayout title={`Kanjisense | ${figure.key}`}>
			<DictionaryLayout>
				<div>
					<h1>
						{figure.key} - {figure.keyword}
					</h1>
					<p>This is the dictionary page.</p>
				</div>
			</DictionaryLayout>
		</RootLayout>
	);
}
