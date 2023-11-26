import { Notice } from "obsidian";
import { ViewManager } from "src/view-manager";

export abstract class Task {
	constructor(viewManager: ViewManager) {
		this.viewManager = viewManager;
	}

	viewManager: ViewManager;

	abstract notice: string;

	async run() {
		const loadingNotice = Task.buildLoadingNotice(this.notice);
		try {
			await this._run();
			loadingNotice.hide();
		} catch (err) {
			loadingNotice.hide();
		}
	}

	abstract _run(): void;

	// Create loading spin in the Notice message.
	static buildLoadingNotice(text: string, number = 2000): Notice {
		const notice = new Notice("", number);
		const loadingContainer = document.createElement("div");
		loadingContainer.addClass("loading-container");

		const loadingIcon = document.createElement("div");
		loadingIcon.addClass("loading-icon");
		const loadingText = document.createElement("span");
		loadingText.textContent = text;
		notice.noticeEl.empty();
		loadingContainer.appendChild(loadingIcon);
		loadingContainer.appendChild(loadingText);
		notice.noticeEl.appendChild(loadingContainer);

		return notice;
	}
}
