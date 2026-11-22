import { apiClient } from "./apiClient";

export const authService = {
  changePassword: (currentPassword: string, newPassword: string) => apiClient.post<void>("/auth/change-password", { currentPassword, newPassword }),
};
