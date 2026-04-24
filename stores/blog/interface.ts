import {
  type Blog,
  type BlogCreateReq,
  type BlogListReq,
  type BlogListResp,
  type BlogCursorListReq,
  type BlogCursorListResp,
  type RelatedBlogsReq,
} from "@/types/blog";

export interface IBlogStore {
  create(data: BlogCreateReq): Promise<Blog>;
  update(id: string, data: Partial<BlogCreateReq>): Promise<Blog | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Blog | null>;
  findBySlug(slug: string): Promise<Blog | null>;
  findAll(params?: BlogListReq): Promise<BlogListResp>;
  findAllWithCursor(params: BlogCursorListReq): Promise<BlogCursorListResp>;
  findRelatedBlogs(params: RelatedBlogsReq): Promise<Blog[]>;
  togglePublish(id: string): Promise<Blog | null>;
}
