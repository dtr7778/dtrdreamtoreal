export class ApiResponse<T = unknown> {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;

  constructor({
    message,
    success = true,
    statusCode,
    data,
  }: {
    statusCode: number;
    message: string;
    success?: boolean;
    data: T;
  }) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
