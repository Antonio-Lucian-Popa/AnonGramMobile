import { Comment, CreateCommentData, PaginatedResponse } from "@/types";
import { api } from "@/utils/api";
import { create } from "zustand";

interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    hasMore: boolean;
  };
  
  fetchComments: (postId: string, refresh?: boolean) => Promise<void>;
  fetchMoreComments: (postId: string) => Promise<void>;
  createComment: (data: CreateCommentData) => Promise<Comment | null>;
  deleteComment: (id: string, userId: string) => Promise<void>;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    hasMore: true,
  },

  fetchComments: async (postId: string, refresh = false) => {
    const { pagination } = get();
    const page = refresh ? 0 : pagination.page;
    
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<PaginatedResponse<Comment>>(
        `/comments/post/${postId}?page=${page}&size=${pagination.size}`
      );
      
      set({
        comments: refresh ? data.content : [...get().comments, ...data.content],
        pagination: {
          page: data.pageable.pageNumber,
          size: data.pageable.pageSize,
          totalPages: data.totalPages,
          hasMore: !data.last,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch comments error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch comments", 
        isLoading: false 
      });
    }
  },

  fetchMoreComments: async (postId: string) => {
    const { pagination, isLoading } = get();
    
    if (isLoading || !pagination.hasMore) return;
    
    set({ pagination: { ...pagination, page: pagination.page + 1 } });
    await get().fetchComments(postId);
  },

  createComment: async (data: CreateCommentData) => {
    set({ isLoading: true, error: null });
    try {
      const newComment = await api.post<Comment>("/comments", data);
      
      // Update comments list with the new comment
      set({ 
        comments: [newComment, ...get().comments],
        isLoading: false 
      });
      
      return newComment;
    } catch (error) {
      console.error("Create comment error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to create comment", 
        isLoading: false 
      });
      return null;
    }
  },

  deleteComment: async (id: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/comments/${id}?userId=${userId}`);
      
      // Remove comment from list
      set({ 
        comments: get().comments.filter(comment => comment.id !== id),
        isLoading: false 
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete comment", 
        isLoading: false 
      });
    }
  },
}));