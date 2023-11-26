import { ViewManager } from "src/view-manager";
import { Task } from "./task";
import { requestUrl } from "obsidian";

export class PhrasalVerbs extends Task {
	constructor(viewManager: ViewManager) {
		super(viewManager);
	}

	notice = "🕛 Getting phrasal verbs...";

	async _run() {
		const input = (await this.viewManager.getContent()) ?? "";
		console.log(`_run() input ${input.substring(0, 120)}`);

		const answer = await this.request(input);
		console.log(answer);

		// create notes consider to answer
		for (const [first, second] of Object.entries(answer)) {
			console.log(`${first} -> ${second}`);
			// TODO
		}
	}

	async request(text: string): Promise<string> {
		const baseUrl = "http://127.0.0.1:8000/";
		const headers = {
			"Content-Type": "application/json",
		};

		// set languages
		console.log(`request() set languages`);
		await requestUrl({
			url: `${baseUrl}languages`,
			method: "POST",
			headers: headers,
			body: JSON.stringify({ first: "en", second: "uk" }),
		});

		// TODO set text
		console.log(`request() set text`);
		await requestUrl({
			url: `${baseUrl}text`,
			method: "POST",
			headers: headers,
			body: JSON.stringify({ value: text }),
		});

		// get phrasal verbs
		console.log(`request() get phrasal verbs`);
		const response = await requestUrl({
			url: `${baseUrl}phrasal-verbs`,
			method: "GET",
			headers: headers,
		});

		console.log(`request() response ${response}`);
		if (response.status >= 400) {
			throw new Error(`${baseUrl} sent error ${response.status}.`);
		}

		const data = JSON.parse(response.text);
		console.log(`request() data ${data}`);

		return data.mapped_result;
	}
}
