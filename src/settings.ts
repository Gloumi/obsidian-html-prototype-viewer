import { App, PluginSettingTab, Setting } from "obsidian";
import type HtmlPrototypeViewerPlugin from "./main";
import { TranslationKey, t } from "./i18n";

export type ViewportId = "full" | "desktop" | "tablet" | "mobile";

export interface Viewport {
	id: ViewportId;
	labelKey: TranslationKey;
	/** Largeur imposée à l'iframe, en px. `null` = pleine largeur du panneau. */
	width: number | null;
}

export const VIEWPORTS: Viewport[] = [
	{ id: "full", labelKey: "viewport.full", width: null },
	{ id: "desktop", labelKey: "viewport.desktop", width: 1280 },
	{ id: "tablet", labelKey: "viewport.tablet", width: 834 },
	{ id: "mobile", labelKey: "viewport.mobile", width: 390 },
];

export function viewportById(id: ViewportId): Viewport {
	return VIEWPORTS.find((v) => v.id === id) ?? VIEWPORTS[0];
}

export interface HtmlPrototypeSettings {
	/** Largeur de rendu appliquée à l'ouverture d'un prototype. */
	viewport: ViewportId;
	/** Recharge l'iframe quand le fichier change sur le disque. */
	autoReload: boolean;
	/**
	 * Retire `allow-same-origin` du sandbox. Le prototype tourne alors dans une
	 * origine opaque : aucun accès à l'API Obsidian, mais plus de localStorage
	 * ni de fetch vers les fichiers voisins.
	 */
	strictIsolation: boolean;
	/** Hauteur par défaut, en px, des blocs `html-preview` dans les notes. */
	embedHeight: number;
}

export const DEFAULT_SETTINGS: HtmlPrototypeSettings = {
	viewport: "full",
	autoReload: true,
	strictIsolation: false,
	embedHeight: 600,
};

export class HtmlPrototypeSettingTab extends PluginSettingTab {
	private plugin: HtmlPrototypeViewerPlugin;

	constructor(app: App, plugin: HtmlPrototypeViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(t("setting.viewport.name"))
			.setDesc(t("setting.viewport.desc"))
			.addDropdown((dd) => {
				for (const vp of VIEWPORTS) dd.addOption(vp.id, t(vp.labelKey));
				dd.setValue(this.plugin.settings.viewport).onChange(async (value) => {
					this.plugin.settings.viewport = value as ViewportId;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(t("setting.autoReload.name"))
			.setDesc(t("setting.autoReload.desc"))
			.addToggle((tg) =>
				tg.setValue(this.plugin.settings.autoReload).onChange(async (value) => {
					this.plugin.settings.autoReload = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t("setting.embedHeight.name"))
			.setDesc(t("setting.embedHeight.desc"))
			.addText((tx) =>
				tx
					.setPlaceholder(String(DEFAULT_SETTINGS.embedHeight))
					.setValue(String(this.plugin.settings.embedHeight))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (!Number.isFinite(parsed) || parsed <= 0) return;
						this.plugin.settings.embedHeight = parsed;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t("setting.strictIsolation.name"))
			.setDesc(t("setting.strictIsolation.desc"))
			.addToggle((tg) =>
				tg.setValue(this.plugin.settings.strictIsolation).onChange(async (value) => {
					this.plugin.settings.strictIsolation = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
