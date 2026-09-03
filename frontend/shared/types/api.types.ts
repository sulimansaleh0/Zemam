export interface ServiceSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ServiceFailure {
  success: false;
  status: number;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;
