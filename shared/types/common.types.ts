export type AnyFieldErrors = Record<string, string | undefined>;
export type ActionResponse = {
  success: boolean;
  message: string;
  fieldErrors?: AnyFieldErrors;
};
