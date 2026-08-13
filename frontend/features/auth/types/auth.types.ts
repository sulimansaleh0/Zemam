// ============================================================
//  Auth Types — Enterprise Domain Model
// ============================================================

export interface AddressDetails {
  country: string;
  city: string;
  streetDetails: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  address: AddressDetails;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface VerifyCodePayload {
  token: string;
  code: string;
  email?: string;
}

export interface NewPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  address: AddressDetails;
}

export interface LoginResponse {
  user: AuthUser;
  message: string;
}

export interface SignupResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
  token?: string;
}

export interface VerifyCodeResponse {
  message: string;
  token?: string;
}

export interface NewPasswordResponse {
  message: string;
}
