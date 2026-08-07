// ─── API Helper Service for Centralised Platform ──────────────────────────────

const API_BASE = "http://localhost:5000/api";

export function getToken(): string | null {
  return localStorage.getItem("evently_token");
}

export function setToken(token: string) {
  localStorage.setItem("evently_token", token);
}

export function removeToken() {
  localStorage.removeItem("evently_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  signup: async (name: string, email: string, password: string, role: string) => {
    const data = await request<{ token: string; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    setToken(data.token);
    return data;
  },

  getMe: async () => {
    return request<{ user: any }>("/auth/me");
  },

  updateProfile: async (profile: { name?: string; avatarUrl?: string; roleTitle?: string }) => {
    return request<{ message: string; user: any }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  },

  logout: () => {
    removeToken();
  },

  // Events
  getEvents: async (params?: { category?: string; search?: string; trending?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.trending) query.append("trending", "true");

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request<{ events: any[] }>(`/events${queryString}`);
  },

  getEventById: async (id: number) => {
    return request<{ event: any }>(`/events/${id}`);
  },

  createEvent: async (eventData: any) => {
    return request<{ message: string; event: any }>("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  updateEvent: async (id: number, eventData: any) => {
    return request<{ message: string; event: any }>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },

  deleteEvent: async (id: number) => {
    return request<{ message: string }>(`/events/${id}`, {
      method: "DELETE",
    });
  },

  // Kanban Tasks
  getTasks: async () => {
    return request<{ tasks: { todo: any[]; inProgress: any[]; done: any[] } }>("/tasks");
  },

  createTask: async (task: { title: string; priority: string; due?: string; stage?: string }) => {
    return request<{ message: string; task: any }>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  updateTask: async (id: string | number, updates: { stage?: string; priority?: string; title?: string }) => {
    return request<{ message: string; task: any }>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteTask: async (id: string | number) => {
    return request<{ message: string }>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Leaderboard
  getLeaderboard: async () => {
    return request<{ leaderboard: any[] }>("/volunteers/leaderboard");
  },

  // Tickets
  registerForEvent: async (eventId: number) => {
    return request<{ message: string; ticket: any }>(`/tickets/register/${eventId}`, {
      method: "POST",
    });
  },

  getMyTickets: async () => {
    return request<{ tickets: any[] }>("/tickets/my-tickets");
  },

  // Analytics Overview
  getAnalyticsOverview: async () => {
    return request<{ overview: any; categoryData: any[]; analyticsData: any[] }>("/analytics/overview");
  },

  // Announcements
  getAnnouncements: async () => {
    return request<{ announcements: any[] }>("/announcements");
  },

  createAnnouncement: async (announcement: { title: string; body: string; urgent?: boolean }) => {
    return request<{ message: string; announcement: any }>("/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    });
  },
};
