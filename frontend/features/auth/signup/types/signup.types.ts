export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
}

export interface SignupResponse {
  token?: string;
}
