// Auto-generated from OpenAPI spec - apps/api/openapi.yaml
// Run 'bun run generate:api' to regenerate

export interface HealthResponse {
  status: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface OpenAPIConfig {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: 'include' | 'omit' | 'same-origin';
  TOKEN: string | BearerToken | RefreshToken | void;
  USERNAME: string | void;
  PASSWORD: string | void;
  HEADERS: (HeadersInit | ((headers: HeadersInit) => HeadersInit)) | void;
}

export const OpenAPI: OpenAPIConfig;
