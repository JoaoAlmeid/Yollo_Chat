import { Schedule } from "@prisma/client"

export interface CompanyData {
  name: string
  id?: number | string
  phone?: string
  email?: string
  password?: string
  status?: boolean
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
}

export interface ListRequest {
  searchParam?: string;
  pageNumber?: string;
}

export interface ListResponse {
  companies: Company[];
  count: number;
  hasMore: boolean;
}

export interface ScheduleData {
  id: number | string
  schedules: Schedule[]
}

export interface Result {
  id: number;
  currentSchedule: any;
  startTime: string;
  endTime: string;
  inActivity: boolean;
}

export interface CurrentSchedules {
  weekdayEn: string;
  startTime: string;
  endTime: string;
}