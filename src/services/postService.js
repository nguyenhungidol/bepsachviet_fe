import { toast } from "react-toastify";
import { apiRequest } from "./apiClient";

const DEFAULT_THUMBNAIL = "/images/post-placeholder.jpg";

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const normalizePost = (post) => {
  if (!post) return null;
  return {
    id: post.postId || post.id || post.slug,
    postId: post.postId || post.id || null,
    slug: post.slug,
    title: post.title,
    shortDescription: post.shortDescription || "",
    content: post.content || "",
    thumbnailUrl: post.thumbnailUrl || DEFAULT_THUMBNAIL,
    author: post.author || "Ẩn danh",
    categoryId: post.categoryId,
    categoryName: post.categoryName,
    isFeatured: Boolean(post.isFeatured),
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const normalizePageResponse = (response) => {
  if (Array.isArray(response)) {
    const content = response.map(normalizePost).filter(Boolean);
    return {
      content,
      totalPages: 1,
      totalElements: content.length,
      number: 0,
      size: content.length || 1,
    };
  }

  const contentSource = Array.isArray(response?.content)
    ? response.content
    : Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];

  const content = contentSource.map(normalizePost).filter(Boolean);

  return {
    content,
    totalPages: response?.totalPages ?? 1,
    totalElements: response?.totalElements ?? content.length,
    number: response?.number ?? 0,
    size: response?.size ?? (content.length || 1),
  };
};

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const normalized = typeof value === "string" ? value.trim() : value;
    if (normalized === "") return;
    query.set(key, normalized);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

export const fetchPosts = async ({
  page = 0,
  size = 9,
  categoryId,
  search,
  status = "PUBLISHED",
} = {}) => {
  const query = buildQuery({ page, size, categoryId, search, status });
  const response = await apiRequest(`/posts${query}`);
  return normalizePageResponse(response);
};

export const fetchFeaturedPosts = async ({ limit = 5 } = {}) => {
  const query = buildQuery({ limit });
  const response = await apiRequest(`/posts/featured${query}`);
  return ensureArray(response).map(normalizePost).filter(Boolean);
};

export const fetchPostBySlug = async (slug) => {
  if (!slug) {
    const message = "Không tìm thấy bài viết.";
    toast.error(message);
    return Promise.reject(new Error(message));
  }
  const data = await apiRequest(`/posts/${slug}`);
  const normalized = normalizePost(data);
  if (!normalized) {
    const message = "Bài viết không hợp lệ.";
    toast.error(message);
    return Promise.reject(new Error(message));
  }
  return normalized;
};

export const fetchRelatedPosts = async ({
  slug,
  categoryId,
  limit = 3,
} = {}) => {
  const query = buildQuery({ slug, categoryId, limit });
  const response = await apiRequest(`/posts/related${query}`);
  return ensureArray(response).map(normalizePost).filter(Boolean);
};

const postService = {
  fetchPosts,
  fetchFeaturedPosts,
  fetchPostBySlug,
  fetchRelatedPosts,
};

export default postService;
