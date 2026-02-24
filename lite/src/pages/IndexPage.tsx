import DictionaryLayout from "@/components/DictionaryLayout";
import { RootLayout } from "@/components/RootLayout";

export function IndexPage() {
	return (
		<RootLayout title="Kanjisense">
			<DictionaryLayout>
				<div>
					<h1>Welcome to the Index Page</h1>
					<p>This is the main landing page of the application.</p>
				</div>
			</DictionaryLayout>
		</RootLayout>
	);
}
