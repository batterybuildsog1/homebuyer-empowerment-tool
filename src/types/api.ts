/**
 * Generic API result type for all service calls
 */
export type ApiResult<T> =
  | { success: true; data: T; source?: string; fromCache?: boolean }
  | { success: false; error: string; errorCode?: string };
