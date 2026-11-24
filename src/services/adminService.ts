import { apiClient } from "./apiClient";
import type { ApiActivityEntry, ApiAdminOverview, ApiUser } from "@/types/api";

export type ActivityCategory = "all" | "auth" | "users" | "fleet" | "trips" | "notifications" | "settings";

export interface CreateUserInput { email: string; fullName: string; password: string; role: ApiUser["role"]; telegramChatId: string }
export interface UpdateUserInput { fullName?: string; role?: ApiUser["role"]; isActive?: boolean; telegramChatId?: string }

export const adminService = {
  overview: () => apiClient.get<ApiAdminOverview>("/admin/overview"),
  activity: (category: ActivityCategory, before?: string) => {
    const query = new URLSearchParams({ category, limit: "50" });
    if (before) query.set("before", before);
    return apiClient.get<ApiActivityEntry[]>(`/admin/activity?${query.toString()}`);
  },
  users: () => apiClient.get<ApiUser[]>("/users"),
  createUser: (input: CreateUserInput) => apiClient.post<ApiUser>("/users", input),
  updateUser: (id: string, input: UpdateUserInput) => apiClient.patch<ApiUser>(`/users/${encodeURIComponent(id)}`, input),
};
