import { NextFunction } from "express";
import { ApiResponse, MiddlewareResponse } from "../types/auth.types";
import { Request } from "express";
declare const verifyAccessToken: (req: Request, res: ApiResponse, next: NextFunction) => Promise<ApiResponse | void>;
declare const verifyRefreshToken: (req: Request, res: ApiResponse, next: NextFunction) => Promise<ApiResponse | void>;
declare const expressValidationHandler: (req: Request, res: ApiResponse, next: NextFunction) => MiddlewareResponse;
export { verifyAccessToken, verifyRefreshToken, expressValidationHandler };
//# sourceMappingURL=auth.middlewares.d.ts.map