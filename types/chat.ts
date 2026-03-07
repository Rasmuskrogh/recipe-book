export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    name: string | null;
    image: string | null;
    username: string;
  };
}
