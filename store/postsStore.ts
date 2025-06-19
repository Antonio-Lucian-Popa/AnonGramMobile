import { CreatePostData, PaginatedResponse, Post, PostFilters, VoteData } from "@/types";
import { api } from "@/utils/api";
import { create } from "zustand";

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  filters: PostFilters;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    hasMore: boolean;
  };
  
  fetchPosts: (refresh?: boolean) => Promise<void>;
  fetchMorePosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  createPost: (data: CreatePostData, images?: FormData) => Promise<Post | null>;
  deletePost: (id: string, userId: string) => Promise<void>;
  votePost: (data: VoteData) => Promise<void>;
  setFilters: (filters: Partial<PostFilters>) => void;
  resetFilters: () => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    hasMore: true,
  },

  fetchPosts: async (refresh = false) => {
    const { filters, pagination } = get();
    const page = refresh ? 0 : pagination.page;
    
    set({ isLoading: true, error: null });
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.size.toString(),
      });
      
      if (filters.search) params.append("search", filters.search);
      if (filters.tags && filters.tags.length > 0) params.append("tags", filters.tags.join(","));
      if (filters.latitude) params.append("latitude", filters.latitude.toString());
      if (filters.longitude) params.append("longitude", filters.longitude.toString());
      if (filters.radius) params.append("radius", filters.radius.toString());

      const data = await api.get<PaginatedResponse<Post>>(`/posts?${params.toString()}`);
      
      set({
        posts: refresh ? data.content : [...get().posts, ...data.content],
        pagination: {
          page: data.pageable.pageNumber,
          size: data.pageable.pageSize,
          totalPages: data.totalPages,
          hasMore: !data.last,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch posts error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch posts", 
        isLoading: false 
      });
    }
  },

  fetchMorePosts: async () => {
    const { pagination, isLoading } = get();
    
    if (isLoading || !pagination.hasMore) return;
    
    set({ pagination: { ...pagination, page: pagination.page + 1 } });
    await get().fetchPosts();
  },

  fetchPostById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const post = await api.get<Post>(`/posts/${id}`);
      set({ currentPost: post, isLoading: false });
    } catch (error) {
      console.error("Fetch post error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch post", 
        isLoading: false 
      });
    }
  },

  createPost: async (data: CreatePostData, images?: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add post data
      formData.append("post", JSON.stringify(data));
      
      // Add images if any
      if (images) {
        // Safely add images to formData
        for (let i = 0; i < images.getAll("images").length; i++) {
          const image = images.getAll("images")[i];
          if (image) {
            formData.append("images", image);
          }
        }
      }

      const newPost = await api.postFormData<Post>("/posts", formData);
      
      // Update posts list with the new post
      set({ 
        posts: [newPost, ...get().posts],
        isLoading: false 
      });
      
      return newPost;
    } catch (error) {
      console.error("Create post error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to create post", 
        isLoading: false 
      });
      return null;
    }
  },

  deletePost: async (id: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/posts/${id}?userId=${userId}`);
      
      // Remove post from list
      set({ 
        posts: get().posts.filter(post => post.id !== id),
        isLoading: false 
      });
    } catch (error) {
      console.error("Delete post error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete post", 
        isLoading: false 
      });
    }
  },

  votePost: async (data: VoteData) => {
    try {
      const response = await api.put<VoteData>("/votes", data);
      
      // Update post in the list
      const { posts, currentPost } = get();
      const updatedPosts = posts.map(post => {
        if (post.id === data.postId) {
          // Calculate new vote counts
          let upvotes = post.upvotes;
          let downvotes = post.downvotes;
          
          // Remove previous vote if any
          if (post.currentUserVote === 1) upvotes--;
          if (post.currentUserVote === -1) downvotes--;
          
          // Add new vote
          if (data.voteType === 1) upvotes++;
          if (data.voteType === -1) downvotes++;
          
          return {
            ...post,
            currentUserVote: data.voteType,
            upvotes,
            downvotes,
          };
        }
        return post;
      });
      
      // Also update current post if it's the one being voted
      let updatedCurrentPost = currentPost;
      if (currentPost && currentPost.id === data.postId) {
        let upvotes = currentPost.upvotes;
        let downvotes = currentPost.downvotes;
        
        if (currentPost.currentUserVote === 1) upvotes--;
        if (currentPost.currentUserVote === -1) downvotes--;
        
        if (data.voteType === 1) upvotes++;
        if (data.voteType === -1) downvotes++;
        
        updatedCurrentPost = {
          ...currentPost,
          currentUserVote: data.voteType,
          upvotes,
          downvotes,
        };
      }
      
      set({ 
        posts: updatedPosts,
        currentPost: updatedCurrentPost,
      });
    } catch (error) {
      console.error("Vote error:", error);
      // Don't set global error for votes to avoid disrupting UX
    }
  },

  setFilters: (filters: Partial<PostFilters>) => {
    set({ 
      filters: { ...get().filters, ...filters },
      pagination: { ...get().pagination, page: 0 },
    });
  },

  resetFilters: () => {
    set({ 
      filters: {},
      pagination: { ...get().pagination, page: 0 },
    });
  },
}));