import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";
import type HtmlPrototypeViewerPlugin from "./main";
import { TranslationKey, t } from "./i18n";

export type ViewportId = "full" | "desktop" | "tablet" | "mobile";

export interface Viewport {
	id: ViewportId;
	labelKey: TranslationKey;
	/** Width forced onto the iframe, in px. `null` means the full panel width. */
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
	/** Render width applied when a prototype is opened. */
	viewport: ViewportId;
	/** Reloads the iframe whenever the file changes on disk. */
	autoReload: boolean;
	/**
	 * Drops `allow-same-origin` from the sandbox. The prototype then runs in an
	 * opaque origin: no access to the Obsidian API, but also no localStorage and
	 * no fetching of neighbouring files.
	 */
	strictIsolation: boolean;
	/** Default height, in px, of `html-preview` blocks inside notes. */
	embedHeight: number;
}

export const DEFAULT_SETTINGS: HtmlPrototypeSettings = {
	viewport: "full",
	autoReload: true,
	strictIsolation: false,
	embedHeight: 600,
};

function viewportOptions(): Record<string, string> {
	return Object.fromEntries(VIEWPORTS.map((vp) => [vp.id, t(vp.labelKey)]));
}

export class HtmlPrototypeSettingTab extends PluginSettingTab {
	private plugin: HtmlPrototypeViewerPlugin;

	constructor(app: App, plugin: HtmlPrototypeViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Declarative settings (Obsidian 1.13+). Beyond rendering, this is what makes
	 * the settings reachable from the global settings search. `getControlValue` /
	 * `setControlValue` default to reading and persisting `plugin.settings`, whose
	 * keys match the `key` fields below.
	 */
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: t("setting.viewport.name"),
				desc: t("setting.viewport.desc"),
				control: {
					type: "dropdown",
					key: "viewport",
					options: viewportOptions(),
					defaultValue: DEFAULT_SETTINGS.viewport,
				},
			},
			{
				name: t("setting.autoReload.name"),
				desc: t("setting.autoReload.desc"),
				control: {
					type: "toggle",
					key: "autoReload",
					defaultValue: DEFAULT_SETTINGS.autoReload,
				},
			},
			{
				name: t("setting.embedHeight.name"),
				desc: t("setting.embedHeight.desc"),
				control: {
					type: "number",
					key: "embedHeight",
					defaultValue: DEFAULT_SETTINGS.embedHeight,
					placeholder: String(DEFAULT_SETTINGS.embedHeight),
					min: 1,
					step: 1,
				},
			},
			{
				name: t("setting.strictIsolation.name"),
				desc: t("setting.strictIsolation.desc"),
				control: {
					type: "toggle",
					key: "strictIsolation",
					defaultValue: DEFAULT_SETTINGS.strictIsolation,
				},
			},
		];
	}

	/** Fallback rendering for Obsidian versions older than 1.13. */
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
