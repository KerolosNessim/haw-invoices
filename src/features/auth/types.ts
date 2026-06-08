export interface AdminRole {
  id: number
  name: string
  display_name: string
}

export interface User {
  id: number
  name: string
  email: string
  is_active?: boolean
  is_super_admin?: boolean
  roles?: AdminRole[]
  permissions?: string[]
  token?: string
}

export type LoginData = User & {
  accessToken?: string
  token?: string
  role?: string
}

export interface LoginResponse {
  status: string
  message: string
  data: LoginData | null
}

export interface MeResponse {
  status: string
  message: string
  data: Omit<User, "token"> | null
}
