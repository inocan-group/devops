export function exclusions(file: string): string[] {
  const explicit = file.includes("exclude:")
    ? file
        .replace(/[^\0]*exclude:([^;|\n]*)[\n|;][^\0]*/g, "$1")
        .split(",")
        .map((i) => i.trim())
    : [];
  return Array.from(new Set(explicit.concat(["index", "private"])));
}
