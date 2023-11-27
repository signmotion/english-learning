/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	App,
	MarkdownView,
	Editor,
	FrontMatterCache,
	Notice,
	TFile,
} from "obsidian";

export class ViewManager {
	constructor(app: App) {
		this.app = app;
	}

	app: App;

	async getSelection(editor?: Editor): Promise<string | null> {
		if (editor) {
			return editor.getSelection();
		}
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			return activeView.editor.getSelection();
		}
		return null;
	}

	async getTitle(): Promise<string | null> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			return activeView.file!.basename;
		}
		return null;
	}

	async getContent(): Promise<string | null> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			// delete frontmatter
			let content = activeView.getViewData();
			const file = activeView.file!;
			const frontmatter: FrontMatterCache | undefined =
				this.app.metadataCache.getFileCache(file)?.frontmatter;
			if (frontmatter) {
				content = content.split("---").slice(2).join("---");
			}
			return content;
		}
		return null;
	}

	async getTags(filterRegex?: string): Promise<string[] | null> {
		//@ts-ignore
		const tagsDict = this.app.metadataCache.getTags();
		let tags = Object.keys(tagsDict);
		if (!tags || tags.length == 0) return null;
		// remove #
		tags = tags.map((tag) => tag.replace(/^#/, ""));
		// filter
		if (filterRegex) {
			return tags.filter((tag) => RegExp(filterRegex).test(tag));
		}
		return tags;
	}

	async insertAtTitle(value: string, overwrite = false): Promise<void> {
		const file = this.app.workspace.getActiveFile();
		if (!file) return;
		let newName = file.basename;
		if (overwrite) {
			newName = `${value}`;
		} else {
			newName = `${newName} ${value}`;
		}
		// for windows file name
		newName = newName.replace(/["/<>:|?"]/g, "");
		// @ts-ignore
		const newPath = file.getNewPathAfterRename(newName);
		await this.app.fileManager.renameFile(file, newPath);
	}

	async insertAtCursor(value: string, overwrite = false): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const output = this.preprocessOutput(value);

		if (activeView) {
			const editor = activeView.editor;
			const selection = editor.getSelection();
			if (selection && !overwrite) {
				// replace selection
				editor.setSelection(editor.getCursor("to"));
			}
			// overwrite
			editor.replaceSelection(output);
		}
	}

	async insertAtContentTop(value: string): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const output = this.preprocessOutput(value);

		if (activeView) {
			const editor = activeView.editor;
			const file = activeView.file!;
			const sections =
				this.app.metadataCache.getFileCache(file)?.sections;

			// get the line after frontmatter
			let topLine = 0;
			if (sections && sections[0].type == "yaml") {
				topLine = sections[0].position.end.line + 1;
			}

			// replace top of the content
			editor.setCursor({ line: topLine, ch: 0 });
			editor.replaceSelection(`${output}\n`);
		}
	}

	preprocessOutput(value: string): string {
		return value;
	}

	getCurrentFileLink(): string {
		return this.app.workspace.getActiveFile()?.path ?? "";
	}

	getCurrentFolderLink(): string {
		return this.app.workspace.getActiveFile()?.parent?.path ?? "";
	}

	async createNoteMd(
		title: string,
		content: string,
		replaceIfExists = false
	) {
		this.createNote(title, content, "md");
	}

	async createNote(
		title: string,
		content: string,
		extension: string,
		replaceIfExists = false
	) {
		const baseFilename = title;
		let filename = `${baseFilename}`;
		if (extension != null && extension.length > 0) {
			filename += `.${extension}`;
		}
		const fullpath = `${this.getCurrentFolderLink()}/${filename}`;
		if (await this.app.vault.adapter.exists(fullpath)) {
			if (replaceIfExists) {
				console.log(
					`'${fullpath}'\nThe note already exists. Replacing it...`
				);
				await this.app.vault.adapter.remove(fullpath);
			} else {
				console.log(`'${fullpath}'\nThe note already exists. Skip it.`);
				return;
			}
		}

		const s = content.trim();

		this.app.vault
			.create(fullpath, `${s}\n`)
			.then((newNote: TFile) => {
				console.log(`File ${filename} created`);
			})
			.catch((error: unknown) => {
				console.log(`!) ${error}`);
				new Notice(`Couldn't create new note: ${filename}.`, 5000);
				new Notice(`!) ${error}`, 5000);
			});
	}
}
