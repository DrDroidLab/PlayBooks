// Define the ApiMethod enum
export enum ApiMethod {
  UNKNOWN = "UNKNOWN",
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

// Define the HttpRequest interface
export interface HttpRequest {
  method: ApiMethod;
  url: string;
  headers: string;
  payload: string;
  timeout: string;
  cookies?: string;
}

// Define the ApiTaskType enum
export enum ApiTaskType {
  UNKNOWN = "UNKNOWN",
  HTTP_REQUEST = "HTTP_REQUEST",
}

// Define the base interface for API tasks
export interface ApiBase {
  type: ApiTaskType;
}

// Define the specific interface for HTTP_REQUEST tasks
export interface ApiHttpRequest extends ApiBase {
  type: ApiTaskType.HTTP_REQUEST;
  http_request: HttpRequest;
}

// Define the union type for API task details
export type Api = ApiHttpRequest;
