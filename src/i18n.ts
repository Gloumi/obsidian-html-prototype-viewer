import { moment } from "obsidian";

/**
 * Anglais = source de vérité : toute clé absente d'une autre langue y retombe.
 * La langue suit celle d'Obsidian, exposée via la locale de moment.
 */
const EN = {
	"view.title": "HTML prototype",

	"action.reload": "Reload prototype",
	"action.viewport": "Render width",
	"action.openExternally": "Open in browser",

	"viewport.full": "Full width",
	"viewport.desktop": "Desktop — 1280 px",
	"viewport.tablet": "Tablet — 834 px",
	"viewport.mobile": "Mobile — 390 px",

	"command.reload": "Reload the displayed prototype",
	"command.openExternally": "Open the prototype in the browser",
	"command.insertEmbed": "Insert a prototype preview in the note",

	"setting.viewport.name": "Default render width",
	"setting.viewport.desc":
		"Width applied when opening an HTML file. Can be changed on the fly from the tab toolbar.",
	"setting.autoReload.name": "Reload automatically",
	"setting.autoReload.desc": "Refresh the preview whenever the HTML file changes on disk.",
	"setting.embedHeight.name": "Preview height in notes",
	"setting.embedHeight.desc": "Height in pixels of an html-preview block that does not specify one.",
	"setting.strictIsolation.name": "Strict isolation",
	"setting.strictIsolation.desc":
		"Drops the prototype's origin: it can no longer reach the Obsidian API, but also loses localStorage and loading of neighbouring files. Enable it for HTML you did not write.",

	"embed.button.browser": "Browser",
	"embed.button.tab": "Tab",
	"embed.error.noTarget":
		"No file specified. Expected a path, a [[link]] or `path: …`.",
	"embed.error.notFound": "File not found: {0}",
	"embed.error.notHtml": "{0} is not an HTML file.",
} as const;

export type TranslationKey = keyof typeof EN;

const FR: Partial<Record<TranslationKey, string>> = {
	"view.title": "Prototype HTML",

	"action.reload": "Recharger le prototype",
	"action.viewport": "Largeur de rendu",
	"action.openExternally": "Ouvrir dans le navigateur",

	"viewport.full": "Pleine largeur",
	"viewport.desktop": "Desktop — 1280 px",
	"viewport.tablet": "Tablette — 834 px",
	"viewport.mobile": "Mobile — 390 px",

	"command.reload": "Recharger le prototype affiché",
	"command.openExternally": "Ouvrir le prototype dans le navigateur",
	"command.insertEmbed": "Insérer un aperçu de prototype dans la note",

	"setting.viewport.name": "Largeur d'affichage par défaut",
	"setting.viewport.desc":
		"Largeur appliquée à l'ouverture d'un fichier HTML. Modifiable à la volée depuis la barre d'outils de l'onglet.",
	"setting.autoReload.name": "Recharger automatiquement",
	"setting.autoReload.desc": "Rafraîchit le rendu dès que le fichier HTML est modifié sur le disque.",
	"setting.embedHeight.name": "Hauteur des aperçus dans les notes",
	"setting.embedHeight.desc": "Hauteur en pixels d'un bloc html-preview qui n'en précise pas.",
	"setting.strictIsolation.name": "Isolation stricte",
	"setting.strictIsolation.desc":
		"Prive le prototype de son origine : il ne peut plus atteindre l'API Obsidian, mais perd aussi localStorage et le chargement de fichiers voisins. À activer pour du HTML dont tu n'es pas l'auteur.",

	"embed.button.browser": "Navigateur",
	"embed.button.tab": "Onglet",
	"embed.error.noTarget":
		"Aucun fichier indiqué. Attendu : un chemin, un lien [[…]] ou `path: …`.",
	"embed.error.notFound": "Fichier introuvable : {0}",
	"embed.error.notHtml": "{0} n'est pas un fichier HTML.",
};

function currentLanguage(): string {
	try {
		return moment.locale();
	} catch {
		return "en";
	}
}

/** Traduit `key`, en substituant `{0}`, `{1}`… par `params`. */
export function t(key: TranslationKey, ...params: string[]): string {
	const localized = currentLanguage().startsWith("fr") ? FR[key] : undefined;
	const template = localized ?? EN[key];
	return params.reduce<string>(
		(acc, value, index) => acc.split(`{${index}}`).join(value),
		template,
	);
}
