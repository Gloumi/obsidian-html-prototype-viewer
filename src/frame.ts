import { App, TFile } from "obsidian";

/**
 * Permissions granted to the prototype in every case. `allow-same-origin` is
 * appended on top unless strict isolation is requested (see settings).
 */
const SANDBOX_FLAGS = [
	"allow-scripts",
	"allow-forms",
	"allow-popups",
	"allow-popups-to-escape-sandbox",
	"allow-modals",
	"allow-downloads",
];

export function sandboxAttr(strictIsolation: boolean): string {
	const flags = [...SANDBOX_FLAGS];
	if (!strictIsolation) flags.push("allow-same-origin");
	return flags.join(" ");
}

/**
 * Obsidian's internal URL for a vault file: `app://<hash>/<path>?<mtime>` on
 * desktop, `capacitor://` on mobile. The hash is regenerated on every startup —
 * which is why an `app://local/...` path hand-written into a note does not
 * resolve, while this one works everywhere.
 */
export function resourceUrl(app: App, file: TFile): string {
	return app.vault.getResourcePath(file);
}

export interface FrameOptions {
	strictIsolation: boolean;
	/** Appends a parameter to the src to bypass the cache on a manual reload. */
	cacheBust?: boolean;
}

export function createFrame(app: App, file: TFile, opts: FrameOptions): HTMLIFrameElement {
	const frame = createEl("iframe", { cls: "hpv-frame" });
	frame.setAttribute("sandbox", sandboxAttr(opts.strictIsolation));
	frame.setAttribute("referrerpolicy", "no-referrer");
	frame.setAttribute("title", file.basename);

	let url = resourceUrl(app, file);
	if (opts.cacheBust) {
		url += (url.includes("?") ? "&" : "?") + "hpv=" + Date.now();
	}
	frame.src = url;
	return frame;
}

/**
 * `openWithDefaultApp` is not part of `obsidian.d.ts`, so it is never called
 * blindly: the entry points relying on it are hidden when it is missing, rather
 * than failing silently.
 */
type MaybeOpener = { openWithDefaultApp?: (path: string) => unknown };

export function canOpenExternally(app: App): boolean {
	return typeof (app as unknown as MaybeOpener).openWithDefaultApp === "function";
}

/** Opens the file in the system's default application (the browser). */
export function openExternally(app: App, file: TFile): void {
	const opener = (app as unknown as MaybeOpener).openWithDefaultApp;
	if (typeof opener === "function") opener.call(app, file.path);
}
