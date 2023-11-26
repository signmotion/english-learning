import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { ViewManager } from "src/view-manager";

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
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				await new PhrasalVerbs(this.viewManager).run();
			},
		});
	}
}

class PhrasalVerbs {
	constructor(viewManager: ViewManager) {
		this.viewManager = viewManager;
	}

	viewManager: ViewManager;

	notice = "🕛 Getting phrasal verbs...";

	async run() {
		const loadingNotice = this.createLoadingNotice(this.notice);
		try {
			await this._run();
			loadingNotice.hide();
		} catch (err) {
			loadingNotice.hide();
		}
		// TODO
	}

	async _run() {
		const input = await this.viewManager.getContent();
		this.viewManager.insertAtCursor(
			`${this.notice} ${input?.length} characters\n`
		);
	}

	// Create loading spin in the Notice message.
	createLoadingNotice(text: string, number = 2000): Notice {
		const notice = new Notice("", number);
		const loadingContainer = document.createElement("div");
		loadingContainer.addClass("loading-container");

		const loadingIcon = document.createElement("div");
		loadingIcon.addClass("loading-icon");
		const loadingText = document.createElement("span");
		loadingText.textContent = text;
		//@ts-ignore
		notice.noticeEl.empty();
		loadingContainer.appendChild(loadingIcon);
		loadingContainer.appendChild(loadingText);
		//@ts-ignore
		notice.noticeEl.appendChild(loadingContainer);

		return notice;
	}
}
