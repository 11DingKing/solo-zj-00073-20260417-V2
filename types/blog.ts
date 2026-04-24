import type { Category } from "./category";
import type { CommonModel, ListReq, CursorPaginationReq, CursorPaginationResp, SearchHighlight } from "./common";
import type { Tag } from "./tag";

export interface Blog extends CommonModel {
  title: string;
  slug: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  categoryId: string;
  category?: Category;
  tags?: Tag[];
  _highlight?: SearchHighlight;
}

export interface BlogListReq extends ListReq {
  title?: string;
  search?: string;
  slug?: string;
  categoryId?: string;
  tagId?: string;
  tagIds?: string[];
  blogIDs?: string[];
  published?: boolean;
}

export interface BlogCursorListReq extends CursorPaginationReq {
  search?: string;
  categoryId?: string;
  tagId?: string;
  published?: boolean;
}

export interface BlogListResp {
  total: number;
  lists: Blog[] | null;
}

export type BlogCursorListResp = CursorPaginationResp<Blog>;

export interface BlogCreateReq {
  title: string;
  slug: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  categoryId: string;
  tags?: string[];
}

export interface RelatedBlogsReq {
  blogId: string;
  categoryId: string;
  limit?: number;
}
