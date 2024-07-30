export enum ErrorType {
  GENERAL = "general",
  TASK_FAILED = "task_failed",
  AUTHENTICATION = "authorization",
}

export class CustomError {
  type: ErrorType;
  message: string;
  constructor(message: string, type: ErrorType) {
    this.message = message;
    this.type = type || ErrorType.GENERAL;
  }
}
