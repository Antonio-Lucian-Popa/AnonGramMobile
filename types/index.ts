export interface User {
  id: string;
  keycloakId: string;
  email: string;
  alias: string;
  createdAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export interface Post {
  id: string;
  userId: string;
  text: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  tags: string[];
  createdAt: string;
  expiresAt?: string;
  userAlias: string;
  currentUserVote?: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userAlias: string;
  text: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  postId: string;
  userId: string;
  voteType: number;
  createdAt: string;
}

export interface Report {
  id: string;
  postId: string;
  userId: string;
  reason: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface PostFilters {
  search?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  alias?: string;
  userRole: string;
}

export interface CreatePostData {
  userId: string;
  text: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  expiresAt?: string;
}

export interface CreateCommentData {
  postId: string;
  userId: string;
  text: string;
}

export interface VoteData {
  postId: string;
  userId: string;
  voteType: number;
}