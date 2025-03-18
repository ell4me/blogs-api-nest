export enum DomainExceptionCode {
  NotFound = 1,
  BadRequest = 2,
  Forbidden = 3,
  Unauthorized = 4,
}

type Extension = {
  message: string;
  key: string;
};

export class DomainException {
  constructor(
    public message: string,
    public code: DomainExceptionCode,
    public extension: Extension[],
  ) {}
}

// mixin
const ConcreteDomainExceptionFactory = (
  commonMessage: string,
  code: DomainExceptionCode,
) => {
  return class extends DomainException {
    constructor(extension: Extension[]) {
      super(commonMessage, code, extension);
    }

    static create(message?: string, key?: string) {
      return new this(message ? [{ message, key: key ? key : 'field' }] : []);
    }
  };
};

export const NotFoundDomainException = ConcreteDomainExceptionFactory(
  'Not Found',
  DomainExceptionCode.NotFound,
);

export const BadRequestDomainException = ConcreteDomainExceptionFactory(
  'Bad Request',
  DomainExceptionCode.BadRequest,
);

export const UnauthorizedDomainException = ConcreteDomainExceptionFactory(
  'Unauthorized',
  DomainExceptionCode.Unauthorized,
);

export const ForbiddenDomainException = ConcreteDomainExceptionFactory(
  'Forbidden',
  DomainExceptionCode.Forbidden,
);
