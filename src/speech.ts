import { ViewManager } from "src/view-manager";
import { Task } from "./task";

export class Speech extends Task {
	constructor(viewManager: ViewManager) {
		super(viewManager);
	}

	notice = "🕛 Voicing the paragraph...";

	async _run() {
		let input = await this.viewManager.getContentFromActiveNote();
		const insert = `${this.notice} ${input?.length} characters\n`;
		input = input?.replace(insert, "") ?? "";
		this.viewManager.insertAtCursor(insert);

		// TODO
	}
}
