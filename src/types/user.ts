export interface User {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  createdAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  username: string
  displayName: string
}

export interface AuthSession {
  user: User
  accessToken: string
}
