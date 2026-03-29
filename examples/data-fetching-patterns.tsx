/**
 * Data Fetching Patterns - React Query Examples
 * 
 * Demonstrates:
 * - Basic queries with loading/error states
 * - Mutations with optimistic updates
 * - Infinite queries for pagination
 * - Dependent queries
 * - Error boundaries
 * - Suspense integration
 * - Prefetching strategies
 */

import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  queryOptions,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { z } from 'zod';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
});

const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
  createdAt: z.string(),
});

const commentSchema = z.object({
  id: z.number(),
  postId: z.number(),
  content: z.string(),
  authorId: z.number(),
});

type User = z.infer<typeof userSchema>;
type Post = z.infer<typeof postSchema>;
type Comment = z.infer<typeof commentSchema>;

// =============================================================================
// API CLIENT
// =============================================================================

const API_BASE_URL = 'https://api.example.com';

class APIClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async getPosts(page = 1, limit = 10): Promise<{ posts: Post[]; hasMore: boolean }> {
    return this.request<{ posts: Post[]; hasMore: boolean }>(
      `/posts?page=${page}&limit=${limit}`
    );
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return this.request<Comment[]>(`/posts/${postId}/comments`);
  }

  async createPost(data: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: number, data: Partial<Post>): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: number): Promise<void> {
    return this.request<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }
}

const apiClient = new APIClient();

// =============================================================================
// QUERY OPTIONS (Reusable Query Configurations)
// =============================================================================

export const userQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => apiClient.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ['posts'],
    queryFn: () => apiClient.getPosts(),
  });

export const postQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ['posts', postId],
    queryFn: () => apiClient.getPost(postId),
  });

export const postCommentsQueryOptions = (postId: number) =>
  queryOptions({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => apiClient.getPostComments(postId),
  });

// =============================================================================
// EXAMPLE 1: BASIC QUERY WITH LOADING/ERROR STATES
// =============================================================================

export function UserProfile({ userId }: { userId: number }) {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(userQueryOptions(userId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <span className="ml-2">Loading user...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <h3 className="font-bold text-red-800">Error loading user</h3>
        <p className="text-sm text-red-600">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="rounded border p-4">
      {user.avatar && (
        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full" />
      )}
      <h2 className="mt-2 text-xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}

// =============================================================================
// EXAMPLE 2: MUTATION WITH OPTIMISTIC UPDATES
// =============================================================================

export function CreatePostForm({ authorId }: { authorId: number }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (newPost: Omit<Post, 'id' | 'createdAt'>) =>
      apiClient.createPost(newPost),
    
    // Optimistic update
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update to the new value
      queryClient.setQueryData<{ posts: Post[]; hasMore: boolean }>(['posts'], (old) => {
        if (!old) return old;
        
        const optimisticPost: Post = {
          ...newPost,
          id: Date.now(), // Temporary ID
          createdAt: new Date().toISOString(),
        };

        return {
          ...old,
          posts: [optimisticPost, ...old.posts],
        };
      });

      return { previousPosts };
    },
    
    // Rollback on error
    onError: (err, newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      alert('Failed to create post: ' + err.message);
    },
    
    // Refetch after success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate({
      title,
      content,
      authorId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded border px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded border px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={createPostMutation.isPending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}

// =============================================================================
// EXAMPLE 3: INFINITE QUERY FOR PAGINATION
// =============================================================================

export function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => apiClient.getPosts(pageParam, 10),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading posts...</div>;
  }

  if (isError) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {data.pages.map((page, pageIndex) => (
        <div key={pageIndex} className="space-y-4">
          {page.posts.map((post) => (
            <div key={post.id} className="rounded border p-4">
              <h3 className="font-bold">{post.title}</h3>
              <p className="mt-2 text-gray-600">{post.content}</p>
              <p className="mt-2 text-sm text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full rounded border px-4 py-2 hover:bg-gray-50 disabled:bg-gray-100"
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// =============================================================================
// EXAMPLE 4: DEPENDENT QUERIES
// =============================================================================

export function PostWithComments({ postId }: { postId: number }) {
  // First query - get the post
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = useQuery(postQueryOptions(postId));

  // Second query - get the post author (depends on post data)
  const {
    data: author,
    isLoading: isLoadingAuthor,
  } = useQuery({
    ...userQueryOptions(post?.authorId ?? 0),
    enabled: !!post, // Only run when post is loaded
  });

  // Third query - get comments (depends on post data)
  const {
    data: comments,
    isLoading: isLoadingComments,
  } = useQuery({
    ...postCommentsQueryOptions(postId),
    enabled: !!post, // Only run when post is loaded
  });

  if (isLoadingPost) {
    return <div>Loading post...</div>;
  }

  if (isPostError || !post) {
    return <div>Error loading post</div>;
  }

  return (
    <div className="space-y-4">
      {/* Post content */}
      <div className="rounded border p-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="mt-2 text-gray-600">{post.content}</p>
        
        {/* Author info (dependent query) */}
        <div className="mt-4 flex items-center">
          {isLoadingAuthor ? (
            <span className="text-sm text-gray-400">Loading author...</span>
          ) : author ? (
            <>
              {author.avatar && (
                <img src={author.avatar} alt={author.name} className="h-8 w-8 rounded-full" />
              )}
              <span className="ml-2 text-sm font-medium">{author.name}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Comments (dependent query) */}
      <div>
        <h2 className="text-xl font-bold">Comments</h2>
        {isLoadingComments ? (
          <p className="mt-2 text-gray-400">Loading comments...</p>
        ) : comments && comments.length > 0 ? (
          <div className="mt-2 space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded border p-3">
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-gray-400">No comments yet</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// EXAMPLE 5: ERROR BOUNDARY
// =============================================================================

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="rounded border border-red-300 bg-red-50 p-4">
          <h2 className="font-bold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-600">{this.state.error.message}</p>
          <button
            onClick={this.resetError}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// EXAMPLE 6: PREFETCHING
// =============================================================================

export function PostListWithPrefetch() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(postsQueryOptions());

  const handleMouseEnter = (postId: number) => {
    // Prefetch post details when user hovers
    queryClient.prefetchQuery(postQueryOptions(postId));
  };

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-2">
      {data?.posts.map((post) => (
        <div
          key={post.id}
          onMouseEnter={() => handleMouseEnter(post.id)}
          className="cursor-pointer rounded border p-4 hover:bg-gray-50"
        >
          <h3 className="font-bold">{post.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{post.content.slice(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// EXAMPLE 7: COMPLETE APP WITH QUERY CLIENT PROVIDER
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function DataFetchingApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="container mx-auto p-8">
          <h1 className="mb-8 text-3xl font-bold">Data Fetching Examples</h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Basic query */}
            <div>
              <h2 className="mb-4 text-xl font-bold">User Profile</h2>
              <UserProfile userId={1} />
            </div>

            {/* Mutation */}
            <div>
              <h2 className="mb-4 text-xl font-bold">Create Post</h2>
              <CreatePostForm authorId={1} />
            </div>

            {/* Dependent queries */}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-xl font-bold">Post with Comments</h2>
              <PostWithComments postId={1} />
            </div>

            {/* Infinite query */}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-xl font-bold">Infinite Scroll</h2>
              <InfinitePostList />
            </div>

            {/* Prefetching */}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-xl font-bold">Posts with Prefetch</h2>
              <PostListWithPrefetch />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
