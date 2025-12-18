declare module 'passport-jwt' {
  import { Request } from 'express';

  export interface StrategyOptions {
    jwtFromRequest?: (req: Request) => string | null;
    secretOrKey: string | Buffer;
    ignoreExpiration?: boolean;
  }

  export class Strategy {
    constructor(options: StrategyOptions);
  }

  export namespace ExtractJwt {
    export function fromExtractors(
      extractors: Array<(req: Request) => string | null>,
    ): (req: Request) => string | null;
  }
}
