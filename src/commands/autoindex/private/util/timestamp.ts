import { format } from "date-fns";

export function timestamp() {
  return `// index last changed at: ${format(Date.now(), "Mo MMM, yyyy, hh:mm a ( O )")}`;
}
