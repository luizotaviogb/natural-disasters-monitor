export interface RegisterRequestDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}

export interface RefreshResponseDto {
  accessToken: string;
}

export interface ErrorResponseDto {
  error: string;
}

export interface ValidationErrorResponseDto {
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface MessageResponseDto {
  message: string;
}
