export interface TokenPayload {
    id: string;
    username: string;
    profile: string;
    companyId: number;
    iat: number;
    exp: number;
}

export type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};