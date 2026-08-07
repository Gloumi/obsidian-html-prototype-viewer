import { Plugin, TFile } from "obsidian";
import { registerEmbed } from "./embed";
import { canOpenExternally, openExternally } from "./frame";
import { t } from "./i18n";
import {
	DEFAULT_SETTINGS,
	HtmlPrototypeSettingTab,
	HtmlPrototypeSettings,
} from "./settings";
import { HtmlPrototypeView, VIEW_TYPE_HTML_PROTOTYPE } from "./view";

export default class HtmlPrototypeViewerPlugin extends Plugin {
	settings: HtmlPrototypeSettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_HTML_PROTOTYPE, (leaf) => new HtmlPrototypeView(leaf, this));
		this.registerExtensions(["html", "htm"], VIEW_TYPE_HTML_PROTOTYPE);

		registerEmbed(this);
		this.addSettingTab(new HtmlPrototypeSettingTab(this.app, this));

		this.addCommand({
			id: "reload-prototype",
			name: t("command.reload"),
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(HtmlPrototypeView);
				if (!view) return false;
				if (!checking) view.reload();
				return true;
			},
		});

		this.addCommand({
			id: "open-prototype-in-browser",
			name: t("command.openExternally"),
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(HtmlPrototypeView);
				if (!view?.file || !canOpenExternally(this.app)) return false;
				if (!checking) openExternally(this.app, view.file);
				return true;
			},
		});

		this.addCommand({
			id: "insert-prototype-embed",
			name: t("command.insertEmbed"),
			editorCallback: (editor) => {
				editor.replaceSelection(
					"```html-preview\npath: \nheight: " + this.settings.embedHeight + "\n```\n",
				);
			},
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile)) return;
				if (file.extension !== "html" && file.extension !== "htm") return;
				if (!canOpenExternally(this.app)) return;
				menu.addItem((item) =>
					item
						.setTitle(t("action.openExternally"))
						.setIcon("external-link")
						.onClick(() => openExternally(this.app, file)),
				);
			}),
		);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
