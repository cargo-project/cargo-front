import { apiClient } from "./apiClient";
import type { ApiRecipient } from "@/types/api";
import type { User } from "@/types/domain";

export interface CreateTelegramRecipientInput {
  name: string;
  telegramChatId: string;
}

const adapt = (item: ApiRecipient): User => ({ id: item.id, name: item.name, telegramChatId: item.telegramChatId, configured: item.active });

export const userService = {
  async getUsers(): Promise<User[]> {
    return (await apiClient.get<ApiRecipient[]>("/notification-recipients")).map(adapt);
  },
  async createTelegramRecipient(input: CreateTelegramRecipientInput): Promise<User> {
    return adapt(await apiClient.post<ApiRecipient>("/notification-recipients", { name: input.name.trim(), telegramChatId: input.telegramChatId.trim(), active: true }));
  },
  deleteTelegramRecipient: (id: string) => apiClient.delete(`/notification-recipients/${encodeURIComponent(id)}`),
};
