import { Files, FilesOptions } from "@prisma/client";

export interface Data {
  name: string;
  companyId: number;
  message: string;
  options?: FilesOptions[];
}

export interface SimpleListRequest {
  companyId: number
  searchParam?: string;
}

export interface Options {
  id?: number;
  name: string;
  path: string;
}

export interface UpdateData {
  id?: number;
  name: string;
  message: string;
  options?: Options[];
}

export interface UpdateRequest {
  fileData: FileData;
  id: string | number;
  companyId: number;
}

interface FilesWithOptions extends Files {
  options: FilesOptions[];
}