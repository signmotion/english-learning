import { App, Editor, MarkdownView, Modal, Notice, Plugin } from "obsidian";

interface LearnEnglishSettings {
	setting: string;
}

const DEFAULT_SETTINGS: LearnEnglishSettings = {
	setting: "default",
};

export default class LearnEnglishPlugin extends Plugin {
	settings: LearnEnglishSettings;

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"English Learning",
			(evt: MouseEvent) => {
				new Notice("This is a notice!");
			}
		);
		ribbonIconEl.addClass("english-learning-plugin-ribbon-class");

		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});

		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("☀️");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
