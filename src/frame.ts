import { App, TFile } from "obsidian";

/**
 * Permissions accordées au prototype dans tous les cas. `allow-same-origin`
 * s'y ajoute sauf si l'isolation stricte est demandée (cf. settings).
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
 * URL interne d'Obsidian pour un fichier du vault : `app://<hash>/<chemin>?<mtime>`
 * sur desktop, `capacitor://` sur mobile. Le hash est régénéré à chaque
 * démarrage — c'est pour ça qu'un `app://local/...` écrit à la main dans une note
 * ne fonctionne pas, alors que celui-ci fonctionne partout.
 */
export function resourceUrl(app: App, file: TFile): string {
	return app.vault.getResourcePath(file);
}

export interface FrameOptions {
	strictIsolation: boolean;
	/** Ajoute un paramètre au src pour contourner le cache lors d'un rechargement manuel. */
	cacheBust?: boolean;
}

export function createFrame(app: App, file: TFile, opts: FrameOptions): HTMLIFrameElement {
	const frame = document.createElement("iframe");
	frame.addClass("hpv-frame");
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
 * `openWithDefaultApp` ne fait pas partie de `obsidian.d.ts`. On ne l'appelle
 * donc jamais à l'aveugle : les points d'entrée qui s'en servent sont masqués
 * quand elle est absente, plutôt que d'échouer en silence.
 */
type MaybeOpener = { openWithDefaultApp?: (path: string) => unknown };

export function canOpenExternally(app: App): boolean {
	return typeof (app as unknown as MaybeOpener).openWithDefaultApp === "function";
}

/** Ouvre le fichier dans l'application par défaut du système (navigateur). */
export function openExternally(app: App, file: TFile): void {
	const opener = (app as unknown as MaybeOpener).openWithDefaultApp;
	if (typeof opener === "function") opener.call(app, file.path);
}
