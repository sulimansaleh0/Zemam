export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  token?: string;
}
