import { Notice, Plugin } from "obsidian";
import { ViewManager } from "src/view-manager";
import { PhrasalVerbs } from "./phrasal-verbs";

export default class LearnEnglishPlugin extends Plugin {
	viewManager = new ViewManager(this.app);

	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"English Learning",
			(evt: MouseEvent) => {
				new Notice("This is a notice!");
			}
		);
		ribbonIconEl.addClass("english-learning-plugin-ribbon-class");

		this.addCommand({
			id: "get-phrasal-verbs",
			name: "Get phrasal verbs and translations 2",
			editorCallback: async () => {
				await new PhrasalVerbs(this.viewManager).run();
			},
		});
	}
}
