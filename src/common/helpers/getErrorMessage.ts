export const getErrorMessage = (field: string, message: string) => ({
  errorsMessages: [{ field, message }],
});
