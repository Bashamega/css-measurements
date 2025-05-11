import {
  access,
  copyFile,
  cp,
  readdir,
  readFile,
  writeFile,
} from "fs/promises";
import { constants } from "fs";
import { getVersion } from "./getVersion.js";

const inputPath = new URL("../../generated/", import.meta.url);
const outputPath = new URL("../../packages/", import.meta.url);
const templatePath = new URL("../../template/", import.meta.url);
const license = new URL("License", templatePath);
const packageJson = new URL("package.json", templatePath);

const toKebabCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const toNormalCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

async function packageTypes(dir: URL): Promise<void> {
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`Failed to read directory: ${dir.href}`, err);
    return;
  }

  const folderName = dir.pathname.split("/").filter(Boolean).at(-1) ?? "";
  const kebabName = toKebabCase(folderName);
  const normalName = toNormalCase(folderName);
  const packageName = "@css-m/" + kebabName == "packages" ? "all" : kebabName;
  const packageVersion = await getVersion(packageName);

  const licensePath = new URL("License", dir);
  const packagePath = new URL("package.json", dir);

  // Add License if missing
  try {
    await access(licensePath, constants.F_OK);
  } catch {
    await copyFile(license, licensePath);
  }

  let content = await readFile(packageJson, "utf-8");

  if (normalName === "packages") {
    content = content.replace(
      "CSS definitions for xyz-normal",
      "All css definitions for measurements",
    );
  } else {
    content = content.replace("xyz-normal", normalName);
  }
  content = content
    .replace("xyz-kebab", packageName)
    .replace("versionNumber", packageVersion);

  await writeFile(packagePath, content);

  // Recurse
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await packageTypes(new URL(entry.name + "/", dir));
    }
  }
}

async function deploy() {
  try {
    await cp(inputPath, outputPath, { recursive: true });
    console.log(`Copied from ${inputPath.href} to ${outputPath.href}`);
    await packageTypes(outputPath);
  } catch (err) {
    console.error(`Deployment failed:`, err);
  }
}

deploy();
