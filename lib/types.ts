export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
}
