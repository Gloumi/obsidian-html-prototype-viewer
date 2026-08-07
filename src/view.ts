import { FileView, Menu, TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";
import type HtmlPrototypeViewerPlugin from "./main";
import { canOpenExternally, createFrame, openExternally } from "./frame";
import { t } from "./i18n";
import { VIEWPORTS, ViewportId, viewportById } from "./settings";

export const VIEW_TYPE_HTML_PROTOTYPE = "html-prototype-view";

export class HtmlPrototypeView extends FileView {
	private plugin: HtmlPrototypeViewerPlugin;
	private stageEl: HTMLElement | null = null;
	private frameEl: HTMLIFrameElement | null = null;
	private viewport: ViewportId;

	constructor(leaf: WorkspaceLeaf, plugin: HtmlPrototypeViewerPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.viewport = plugin.settings.viewport;
		this.navigation = true;
	}

	getViewType(): string {
		return VIEW_TYPE_HTML_PROTOTYPE;
	}

	getIcon(): string {
		return "layout-template";
	}

	getDisplayText(): string {
		return this.file ? this.file.basename : t("view.title");
	}

	canAcceptExtension(extension: string): boolean {
		return extension === "html" || extension === "htm";
	}

	async onOpen(): Promise<void> {
		this.contentEl.addClass("hpv-view");
		this.stageEl = this.contentEl.createDiv({ cls: "hpv-stage" });

		this.addAction("refresh-cw", t("action.reload"), () => this.reload());
		this.addAction("monitor-smartphone", t("action.viewport"), (evt) => this.showViewportMenu(evt));
		if (canOpenExternally(this.app)) {
			this.addAction("external-link", t("action.openExternally"), () => {
				if (this.file) openExternally(this.app, this.file);
			});
		}

		// Enregistré une seule fois pour la durée de vie de la vue : `this.file`
		// change au fil des navigations, la comparaison se fait donc à la volée.
		this.registerEvent(
			this.app.vault.on("modify", (changed: TAbstractFile) => {
				if (!this.plugin.settings.autoReload) return;
				if (this.file && changed.path === this.file.path) this.reload();
			}),
		);
	}

	async onLoadFile(file: TFile): Promise<void> {
		this.render(file);
	}

	async onUnloadFile(): Promise<void> {
		this.frameEl = null;
		this.stageEl?.empty();
	}

	async onClose(): Promise<void> {
		this.frameEl = null;
		this.contentEl.empty();
	}

	private render(file: TFile, cacheBust = false): void {
		if (!this.stageEl) return;
		this.stageEl.empty();
		this.frameEl = createFrame(this.app, file, {
			strictIsolation: this.plugin.settings.strictIsolation,
			cacheBust,
		});
		this.stageEl.appendChild(this.frameEl);
		this.applyViewport();
	}

	reload(): void {
		if (this.file) this.render(this.file, true);
	}

	private applyViewport(): void {
		const vp = viewportById(this.viewport);
		this.stageEl?.toggleClass("is-constrained", vp.width !== null);
		if (vp.width !== null) {
			this.frameEl?.style.setProperty("--hpv-frame-width", `${vp.width}px`);
		} else {
			this.frameEl?.style.removeProperty("--hpv-frame-width");
		}
	}

	private showViewportMenu(evt: MouseEvent): void {
		const menu = new Menu();
		for (const vp of VIEWPORTS) {
			menu.addItem((item) =>
				item
					.setTitle(t(vp.labelKey))
					.setChecked(vp.id === this.viewport)
					.onClick(() => {
						this.viewport = vp.id;
						this.applyViewport();
					}),
			);
		}
		menu.showAtMouseEvent(evt);
	}
}
