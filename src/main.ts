import { Plugin } from "obsidian";
import { ViewManager } from "src/view-manager";
import { PhrasalVerbs } from "./phrasal-verbs";
import { Speech } from "./speech";

export default class LearnEnglishPlugin extends Plugin {
	viewManager = new ViewManager(this.app);

	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"English Learning",
			async () => {
				console.log(
					"The plugin installed. See commands `English Learning: *`."
				);
			}
		);
		ribbonIconEl.addClass("english-learning-plugin-ribbon-class");

		this.addCommand({
			id: "get-phrasal-verbs",
			name: "Get phrasal verbs",
			editorCallback: async () => {
				await new PhrasalVerbs(this.viewManager).run();
			},
		});

		this.addCommand({
			id: "speech-paragraph-above",
			name: "Speech the paragraph above",
			editorCallback: async () => {
				await new Speech(this.viewManager).run();
			},
		});
	}
}
