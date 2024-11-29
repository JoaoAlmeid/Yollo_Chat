export interface IndexQuery {
    searchParam: string;
    pageNumber: string;
    companyId?: string | number;
    contactListId?: string | number;
}
  
export interface StoreData {
    name: string;
    number: string;
    contactListId?: number;
    companyId?: string;
    email?: string;
};
  
export interface FindParams {
    companyId?: number;
    contactListId?: number;
}