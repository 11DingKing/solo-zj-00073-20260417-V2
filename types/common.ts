export interface CommonResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface CommonModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListReq {
  page: number;
  pageSize: number;
  sortBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface CursorPaginationReq {
  cursor?: string;
  pageSize: number;
  sortBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface CursorPaginationResp<T> {
  lists: T[];
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface SearchHighlight {
  title?: string;
  description?: string;
}
