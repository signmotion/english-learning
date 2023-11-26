import { ViewManager } from "src/view-manager";
import { Task } from "./task";

export class PhrasalVerbs extends Task {
	constructor(viewManager: ViewManager) {
		super(viewManager);
	}

	notice = "🕛 Getting phrasal verbs...";

	async _run() {
		//const input = await this.viewManager.getContent();
		// TODO
	}
}
