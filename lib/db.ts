import { User, Post, Comment } from './types';

// In-memory database (replace with real database in production)
export const users: User[] = [];
export const posts: Post[] = [];
export const comments: Comment[] = [];

// Helper functions
export const findUserByEmail = (email: string) =>
  users.find(user => user.email === email);

export const findUserById = (id: string) =>
  users.find(user => user.id === id);

export const findPostById = (id: string) =>
  posts.find(post => post.id === id);

export const getPostsByPage = (page: number, limit: number, search?: string) => {
  let filteredPosts = [...posts];

  if (search) {
    const searchLower = search.toLowerCase();
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower)
    );
  }

  filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    posts: filteredPosts.slice(startIndex, endIndex),
    total: filteredPosts.length,
    totalPages: Math.ceil(filteredPosts.length / limit)
  };
};

export const getCommentsByPostId = (postId: string) =>
  comments
    .filter(comment => comment.postId === postId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

export const createUser = (user: User) => {
  users.push(user);
  return user;
};

export const createPost = (post: Post) => {
  posts.push(post);
  return post;
};

export const updatePost = (id: string, data: Partial<Post>) => {
  const index = posts.findIndex(post => post.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...data, updatedAt: new Date() };
  return posts[index];
};

export const deletePost = (id: string) => {
  const index = posts.findIndex(post => post.id === id);
  if (index === -1) return false;

  posts.splice(index, 1);
  // Delete associated comments
  const commentIndices = comments
    .map((comment, idx) => comment.postId === id ? idx : -1)
    .filter(idx => idx !== -1)
    .reverse();

  commentIndices.forEach(idx => comments.splice(idx, 1));
  return true;
};

export const createComment = (comment: Comment) => {
  comments.push(comment);
  return comment;
};

export const deleteComment = (id: string) => {
  const index = comments.findIndex(comment => comment.id === id);
  if (index === -1) return false;

  comments.splice(index, 1);
  return true;
};
