export class ErrorMessage {
  message: string;
  field: string;
}

export class ValidationErrorViewDto {
  errorsMessages: ErrorMessage[];
}
