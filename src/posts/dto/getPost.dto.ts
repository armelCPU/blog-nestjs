export type PostWithUser = {
  postId: number;
  title: string;
  slug: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    userId: number;
    username: string;
    email: string;
  };
};
