export interface Data {
  id?: number | string
  name: string
  companyId?: number | string
}

export interface SearchParams {
  companyId: string
}

export interface ContactRow {
    nome?: string
    Nome?: string
    numero?: string
    número?: string
    Numero?: string
    Número?: string
    email?: string
    'e-mail'?: string
    Email?: string
    'E-mail'?: string
}

export interface ListRequest {
  companyId: number | string;
  searchParam?: string;
  pageNumber?: string;
}

export interface ListResponse {
  records: ContactList[];
  count: number;
  hasMore: boolean;
}