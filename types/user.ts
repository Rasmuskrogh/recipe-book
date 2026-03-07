export interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  recipeCount: number;
  friendCount: number;
}
