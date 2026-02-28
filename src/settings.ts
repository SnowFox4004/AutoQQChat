import {App, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";

export interface MyPluginSettings {
	mySetting: string;
	autoEnableReplace: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	autoEnableReplace: false,
};

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Auto Enable Replace")
			.setDesc("自动打开替换功能")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoEnableReplace)
					.onChange(async (value) => {
						this.plugin.settings.autoEnableReplace = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
