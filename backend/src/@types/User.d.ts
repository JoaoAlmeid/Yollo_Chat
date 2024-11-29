export interface SerializedUser {
  id: number
  name: string
  email: string
  profile: string
  queues: any[]
  companyId?: number
}

export interface ReqUser {
  email: string
  password: string
  name: string
  queueIds?: number[]
  companyId?: number
  profile?: string
  whatsappId?: number
}

export interface ResUser {
  id: number
  name: string
  email: string
  profile: string
}

export interface ResponseUser {
  serializedUser: SerializedUser
  token: string
  refreshToken: string
}

export interface ReqListUser {
  searchParam?: string
  pageNumber?: string | number
  profile?: string
  companyId?: number
}

export interface ResListUser {
  users: any[]
  count: number
  hasMore: boolean
}

export interface UserData {
  email?: string
  password?: string
  name?: string
  profile?: string
  companyId?: number
  queueIds?: number[]
  whatsappId?: number
}

export interface RequestUpUser {
  userData: UserData
  userId: string | number
  companyId: number
  requestUserId: number
}

export interface ResponseUpUser {
  id: number
  name: string
  email: string
  profile: string
}
