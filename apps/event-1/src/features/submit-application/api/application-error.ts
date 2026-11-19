export class ApplicationError extends Error {
  constructor(public readonly code: "INTAKE_CLOSED" | "IDEMPOTENCY_CONFLICT") {
    super(code);
  }
}
