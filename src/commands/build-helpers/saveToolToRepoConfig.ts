import { BuildTool } from "../../@types/defaultConfig";
import { getConfig, writeSection } from "../../shared/index";
/**
 * Saves a given _build tool_ as the default for the current
 * repo.
 */
export async function saveToolToRepoConfig(tool: BuildTool) {
  const { build } = await getConfig();
  build.buildTool = tool;
  await writeSection("build", build);
}
