export class ServiceError {
    constructor(
        public readonly code: string,
        public readonly description?: string,
        public readonly data?: any
    ) {}
}
