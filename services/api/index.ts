const BASE_URL =  process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function adminFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(r => r.json());
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST", body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    }),
  googleAuth: (token: string) =>
    request<{ token: string; user: User }>("/auth/google", {
      method: "POST", body: JSON.stringify({ token }),
    }),
  me: () => request<User>("/auth/me"),
};

export const chatApi = {
  // ── User ──
  getMessages: () =>
    request<{ messages: UserMessage[]; adminMessages: AdminDirectMessage[] }>("/chat/messages"),

  sendMessage: (content: string) =>
    request<UserMessage>("/chat/messages", {
      method: "POST", body: JSON.stringify({ content }),
    }),

  editMessage: (id: string, content: string) =>
    request<Pick<UserMessage, "id" | "content" | "edited" | "editedAt">>(`/chat/messages/${id}`, {
      method: "PATCH", body: JSON.stringify({ content }),
    }),

  getUnreadCount: () =>
    request<{ count: number }>("/chat/unread-count"),

  // ── Admin ──
  adminGetUsers: (token: string) =>
    adminFetch<AdminUser[]>("/chat/admin/users", token),

  adminGetConversation: (userId: string, token: string) =>
    adminFetch<{ messages: UserMessage[]; adminMessages: AdminDirectMessage[] }>(
      `/chat/admin/conversation/${userId}`, token
    ),

  adminSendMessage: (userId: string, content: string, token: string) =>
    adminFetch<AdminDirectMessage>(`/chat/admin/message/${userId}`, token, {
      method: "POST", body: JSON.stringify({ content }),
    }),

  adminReply: (msgId: string, reply: string, token: string) =>
    adminFetch<Pick<UserMessage, "id" | "reply" | "replyAt">>(
      `/chat/admin/reply/${msgId}`, token, {
        method: "PATCH", body: JSON.stringify({ reply }),
      }
    ),

  adminEditReply: (msgId: string, reply: string, token: string) =>
    adminFetch<Pick<UserMessage, "id" | "reply" | "replyEdited">>(
      `/chat/admin/reply/${msgId}/edit`, token, {
        method: "PATCH", body: JSON.stringify({ reply }),
      }
    ),
};

// ── Types ──

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "USER" | "ADMIN";
}

export interface UserMessage {
  id: string;
  type: "user";
  content: string;
  createdAt: string;
  edited?: boolean;
  editedAt?: string;
  readByAdmin: boolean;
  readAt?: string;
  reply?: string | null;
  replyAt?: string | null;
  replyEdited?: boolean;
}

export interface AdminDirectMessage {
  id: string;
  type: "admin";
  content: string;
  createdAt: string;
  readAt?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  totalMessages: number;
  unreadCount: number;
  lastMessage: {
    content: string;
    createdAt: string;
    readByAdmin: boolean;
  } | null;
}
