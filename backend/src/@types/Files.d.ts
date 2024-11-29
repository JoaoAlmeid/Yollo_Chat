import { FilesOptions, Files } from "@prisma/client"

export interface FilesData {
    id?: number,
    name: string
    companyId: number
    message: string
    options?: FilesOptions[]
}
export interface RequestListFiles {
    companyId: number;
    searchParam?: string;
    pageNumber?: string | number;
}
export interface ResponseListFiles {
    files: Files[];
    count: number;
    hasMore: boolean;
}
export interface RequestUpFiles{
    fileData: FilesData;
    id: string | number;
    companyId: number;
}
