export type ActionResult<T> =
  | { data: T; error?: never }
  | {
      data?: never;
      error: { code: string; message: string; requestId: string };
    };
