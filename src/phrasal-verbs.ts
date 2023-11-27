/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ViewManager } from "src/view-manager";
import { Task } from "./task";
import { requestUrl } from "obsidian";

export class PhrasalVerbs extends Task {
	constructor(viewManager: ViewManager) {
		super(viewManager);
	}

	notice = "🕛 Getting phrasal verbs...";

	async _run() {
		const source = this.viewManager.app.workspace.getActiveFile()?.basename;
		console.log(source);

		const input = (await this.viewManager.getContent()) ?? "";
		console.log(`_run() input ${input.substring(0, 120)}`);

		const answer = await this.contentFromSourceNote(input);
		await this.constructNotesByAnswer(answer);

		let newContent = await this.addLinksToSource(input, answer);
		newContent = `\n[[${source}|SOURCE]]\n\n${newContent}`;
		await this.constructNewNote(newContent);
	}

	async contentFromSourceNote(content: string): Promise<Map<string, string>> {
		console.log("Getting content from source note...");

		console.log("Requesting phrasal verbs by content...");
		const answer = await this.request(content);
		console.log(answer);
		const siftedAnswer = this.siftAnswerBySource(content, answer);
		console.log(siftedAnswer);

		return siftedAnswer;
	}

	siftAnswerBySource(
		content: string,
		answer: Map<string, unknown>
	): Map<string, string> {
		// TODO Be able to look for inaccurate matches.
		console.log("Removing inexact matches...");

		// left keys 100% mathed with source
		const r: Map<string, string> = new Map<string, string>();
		const lowercaseContent = content.toLowerCase();
		for (const [first, second] of Object.entries(answer)) {
			// [first] always in lowercase
			if (lowercaseContent.indexOf(first) != -1) {
				r.set(first, second as string);
			}
		}

		// remove shorter keys that start with the same keys
		const filteredEntries = [...r].filter(([k, v]) => {
			for (const [s] of r) {
				if (s.length != k.length && s.startsWith(k)) {
					return false;
				}
			}
			return true;
		});
		const filteredMap = new Map<string, string>(filteredEntries);

		return filteredMap;
	}

	async constructNotesByAnswer(answer: Map<string, string>) {
		console.log("Construct notes with phrasal verbs consider to answer...");
		for (const [first, second] of answer.entries()) {
			//console.log(`${first} -> ${second}`);
			await this.viewManager.createNoteMd(first, second);
		}
	}

	async addLinksToSource(
		content: string,
		answer: Map<string, string>
	): Promise<string> {
		console.log("Linking the source to the created notes...");

		// we need sort answer because sometimes able something
		// like `work out` and `work out well` and we lost link
		const sortedAnswer = new Map([...answer.entries()].sort());
		console.log(sortedAnswer);

		let newContent = content;
		let lowercaseContent = newContent.toLowerCase();
		for (const first of sortedAnswer.keys()) {
			console.log(first);
			// [first] always in lowercase
			for (let q = 0; ; ) {
				const i = lowercaseContent.indexOf(first, q);
				if (i == -1) {
					break;
				}

				if (i > 0 && lowercaseContent.at(i - 1) != "[") {
					// linking [first]
					const before = newContent.substring(0, i);
					const after = newContent.substring(i + first.length);
					newContent = `${before}[[${first}]]${after}`;
					lowercaseContent = newContent.toLowerCase();
				}

				q = i + first.length + "[[]]".length;
			}
		}

		return newContent;
	}

	async constructNewNote(newContent: string) {
		const title = `!`;
		console.log(`Constructing a new note '${title}'...`);
		await this.viewManager.createNoteMd(title, newContent, true);
	}

	async request(text: string): Promise<Map<string, unknown>> {
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
