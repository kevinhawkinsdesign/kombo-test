import { currentUser } from "@/lib/mock-data"
import { team, getRep } from "@/lib/team"

export interface Person {
  id: string
  name: string
  avatarColor: string
}

// Everyone a task can be assigned to: you + the team.
export function assignableUsers(): Person[] {
  return [
    { id: currentUser.id, name: currentUser.name, avatarColor: currentUser.avatarColor },
    ...team.map((m) => ({ id: m.id, name: m.name, avatarColor: m.avatarColor })),
  ]
}

export function resolveUser(id: string): Person {
  if (id === currentUser.id) {
    return { id, name: currentUser.name, avatarColor: currentUser.avatarColor }
  }
  const rep = getRep(id)
  if (rep) return { id, name: rep.name, avatarColor: rep.avatarColor }
  return { id, name: "Unknown", avatarColor: "#94a3b8" }
}

export type Assigner =
  | { kind: "kai" }
  | { kind: "system" }
  | { kind: "user"; person: Person; isSelf: boolean }

// Who created/assigned a task: Kai (AI), the system, or a person.
export function resolveAssigner(id: string | undefined): Assigner {
  if (!id || id === "kai") return { kind: "kai" }
  if (id === "system") return { kind: "system" }
  return { kind: "user", person: resolveUser(id), isSelf: id === currentUser.id }
}
