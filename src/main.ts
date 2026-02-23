import {
	App,
	Editor,
	EditorPosition,
	moment,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
} from "obsidian";
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from "./settings";

// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	enableReplace: boolean = false;

	isEnabledAutoReplace() {
		if (!this.enableReplace) return false;

		return true;
	}
	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		// this.addRibbonIcon("dice", "Sample", (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice("This isn't a notice!");
		// });

		// this.addRibbonIcon("axis-3d", "Greeting", (evt: MouseEvent) => {
		// 	new Notice("Hello World!");
		// });

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText("Status bar text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "switch-automsg",
			name: "Switch auto replace msg",
			callback: () => {
				this.enableReplace = !this.enableReplace;
				// new SampleModal(this.app).open();
				new Notice(
					"已 " +
						(this.enableReplace ? "开启" : "关闭") +
						" 自动替换",
				);
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: "replace-selected",
		// 	name: "Replace selected content",
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		editor.replaceSelection("Sample editor command");
		// 	},
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: "open-modal-complex",
		// 	name: "Open modal (complex)",
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView =
		// 			this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 		return false;
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "keyup", (evt: KeyboardEvent) => {
			setTimeout(() => {
				if (!this.isEnabledAutoReplace()) return;
				if (evt.key == "Enter") {
					const view =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (view) {
						const markdownEditor = view.editor;
						const cursor = markdownEditor.getCursor();

						let last_line = markdownEditor.getLine(cursor.line - 1);

						// let full_content = markdownEditor.getValue().split("\n");
						let hasFoundChat = false;
						let target_line = -1;

						for (
							let lineno = 0;
							lineno < markdownEditor.lastLine();
							lineno++
						) {
							let line_content = markdownEditor.getLine(lineno);
							if (line_content.trim().startsWith("```chat-qq")) {
								hasFoundChat = true;
							}

							if (hasFoundChat && line_content == "```") {
								target_line = lineno;
								break;
							}
						}

						// construct msg format
						let currentTime = moment().format(
							"YYYY-MM-DD HH:mm:ss",
						);
						let newMsg = `\n我 ${currentTime}\n` + last_line + "\n";

						let originCursorPos = markdownEditor.getCursor();
						let prev_line = { ...originCursorPos };
						prev_line.line -= 1;

						markdownEditor.replaceRange("", prev_line, {
							line: prev_line.line,
							ch: prev_line.ch + last_line.length,
						});
						markdownEditor.setCursor(target_line, 0);
						markdownEditor.replaceRange(
							newMsg,
							markdownEditor.getCursor(),
						);
						markdownEditor.setCursor(
							originCursorPos.line + 2,
							originCursorPos.ch,
						);

						new Notice(window.process.platform);
					}
				}
				// new Notice(evt.key);
			}, 200);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
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
		let { contentEl } = this;
		contentEl.setText("**Woah!**");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
