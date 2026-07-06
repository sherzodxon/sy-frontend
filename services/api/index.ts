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

async function adminFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
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

export interface ConversationPage {
  messages: UserMessage[];
  adminMessages: AdminDirectMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const chatApi = {
  // ── User ──
  // `before` — shu vaqtdan oldingi eskiroq xabarlarni yuklash uchun cursor (ISO string)
  getMessages: (before?: string, limit = 20) =>
    request<ConversationPage>(
      `/chat/messages${before ? `?before=${encodeURIComponent(before)}&limit=${limit}` : `?limit=${limit}`}`
    ),

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

  // `before` — eski xabarlarni bosqichma-bosqich yuklash uchun cursor (ISO string)
  adminGetConversation: (userId: string, token: string, before?: string, limit = 20) =>
    adminFetch<ConversationPage>(
      `/chat/admin/conversation/${userId}${before ? `?before=${encodeURIComponent(before)}&limit=${limit}` : `?limit=${limit}`}`,
      token
    ),

  adminSendMessage: (userId: string, content: string, token: string) =>
    adminFetch<AdminDirectMessage>(`/chat/admin/message/${userId}`, token, {
      method: "POST", body: JSON.stringify({ content }),
    }),

  // Adminning o'zi yuborgan mustaqil xabarini tahrirlash
  adminEditMessage: (msgId: string, content: string, token: string) =>
    adminFetch<Pick<AdminDirectMessage, "id" | "content" | "edited" | "editedAt">>(
      `/chat/admin/message/${msgId}`, token, {
        method: "PATCH", body: JSON.stringify({ content }),
      }
    ),

  // Adminning mustaqil xabarini o'chirish
  adminDeleteMessage: (msgId: string, token: string) =>
    adminFetch<{ id: string; deleted: boolean }>(`/chat/admin/message/${msgId}`, token, {
      method: "DELETE",
    }),

  // Userning xabarini admin tomonidan o'chirish
  adminDeleteUserMessage: (msgId: string, token: string) =>
    adminFetch<{ id: string; deleted: boolean }>(`/chat/admin/user-message/${msgId}`, token, {
      method: "DELETE",
    }),

  // Butun foydalanuvchini (barcha yozishmalari bilan) o'chirish
  adminDeleteUser: (userId: string, token: string) =>
    adminFetch<{ id: string; deleted: boolean }>(`/chat/admin/users/${userId}`, token, {
      method: "DELETE",
    }),
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
  edited?: boolean;
  editedAt?: string | null;
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
