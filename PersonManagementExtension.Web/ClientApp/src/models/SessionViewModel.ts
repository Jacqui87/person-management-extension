export interface SessionViewModel {
  id: string; // Guid represented as string
  userId: number;
  token: string;
  createdAt: string; // DateTime represented as ISO string
}
