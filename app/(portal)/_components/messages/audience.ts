import type { Person, Role, Thread } from "@/lib/portal/types";

/** Who else reads what's written here: said plainly under the message box. */
export function audienceLine(kind: Thread["kind"], role: Role, clients: readonly Person[]) {
  if (kind === "internal") return "Internal: only the studio and contractors see this.";
  if (role === "client") return "The studio gets this here, and replies here or by email.";
  const names = clients.map((p) => p.name.split(" ")[0]);
  const who = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "The client");
  return `${who} also ${names.length > 1 ? "get" : "gets"} this by email, and can reply to it.`;
}
