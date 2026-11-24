import { apiClient } from "./apiClient";
import type { ApiUser } from "@/types/api";

export const authService = {
  changePassword: (currentPassword: string, newPassword: string) => apiClient.post<void>("/auth/change-password", { currentPassword, newPassword }),
  register: (input: { email: string; fullName: string; password: string; telegramChatId: string }) => apiClient.post<{ message: string }>("/auth/register", input),
  updateProfile: (input: { fullName?: string; telegramChatId?: string }) => apiClient.patch<ApiUser>("/auth/me", input),
  requestPasswordReset: (email: string) => apiClient.post<{ message: string }>("/auth/password-reset/request", { email }),
  confirmPasswordReset: (email: string, code: string, newPassword: string) => apiClient.post<void>("/auth/password-reset/confirm", { email, code, newPassword }),
};
