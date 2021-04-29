import { DoDevopObservation, ICommandDescription } from "~/@types";
import { getAllCommands } from "~/shared/core";

/**
 * Produces an array of `ICommandDescription` elements for
 * all of the top level commands in `do-devops`
 */
export function globalCommandDescriptions(
  observations: DoDevopObservation[]
): ICommandDescription[] {
  return getAllCommands(observations).map((i) => {
    return {
      name: i.kind,
      summary: i.description,
    };
  });
}
