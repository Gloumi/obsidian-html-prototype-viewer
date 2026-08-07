/**
 * Copies the built plugin into a local vault for testing.
 *
 * The target vault is read from the OBSIDIAN_VAULT environment variable, or
 * from a `.vault-path` file at the repo root (git-ignored, one line). No path
 * is hard-coded: this repository is public.
 *
 *   npm run build && npm run install-local
 */
import { copyFile, mkdir, readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ARTIFACTS = ["main.js", "manifest.json", "styles.css"];

async function readVaultPath() {
	if (process.env.OBSIDIAN_VAULT) return process.env.OBSIDIAN_VAULT.trim();
	try {
		const raw = await readFile(join(ROOT, ".vault-path"), "utf8");
		const line = raw.trim();
		if (line) return line;
	} catch {
		/* no .vault-path, fall through to the error below */
	}
	throw new Error(
		"No target vault. Set OBSIDIAN_VAULT, or write the vault's absolute path " +
			"into a `.vault-path` file at the repo root.",
	);
}

async function main() {
	const vault = await readVaultPath();
	try {
		await access(join(vault, ".obsidian"));
	} catch {
		throw new Error(`Not an Obsidian vault (no .obsidian directory): ${vault}`);
	}

	const { id } = JSON.parse(await readFile(join(ROOT, "manifest.json"), "utf8"));
	const target = join(vault, ".obsidian", "plugins", id);
	await mkdir(target, { recursive: true });

	for (const name of ARTIFACTS) {
		const from = join(ROOT, name);
		try {
			await access(from);
		} catch {
			throw new Error(`Missing ${name} — run \`npm run build\` first.`);
		}
		await copyFile(from, join(target, name));
		console.log(`  ${name} → ${target}`);
	}
	console.log("Installed. Reload Obsidian to pick up the change.");
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
