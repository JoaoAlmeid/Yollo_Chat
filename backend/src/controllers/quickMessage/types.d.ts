export type IndexQuery = {
    searchParam: string;
    pageNumber: string;
    userId: string | number;
};

export interface StoreData {
  shortcode: string;
  message: string;
  userId: number | number;
};

export type FindParams = {
  companyId: string;
  userId: string;
}; 