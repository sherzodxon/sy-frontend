import { AdminDirectMessage, UserMessage } from "@/services/api";

export type ConversationItem =
  | (UserMessage & { kind: "user-msg" })
  | (AdminDirectMessage & { kind: "admin-direct" });

export function buildTimeline(
  userMessages: UserMessage[],
  adminMessages: AdminDirectMessage[]
): ConversationItem[] {
  const all: ConversationItem[] = [
    ...userMessages.map(message => ({ ...message, kind: "user-msg" as const })),
    ...adminMessages.map(message => ({ ...message, kind: "admin-direct" as const })),
  ];

  return all.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatAdminTime(date: string) {
  const value = new Date(date);
  const now = new Date();

  return value.toDateString() === now.toDateString()
    ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : value.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export function formatFullTime(date: string) {
  return new Date(date).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
