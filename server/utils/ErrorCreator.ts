export function createHttpError(statusCode: number, statusMessage: string) {
  return createError({ statusCode, statusMessage })
}
