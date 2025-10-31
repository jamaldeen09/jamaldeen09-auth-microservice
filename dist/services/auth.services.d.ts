import { Response } from "express";
import { ValidationChain } from "express-validator";
import { ApiResponse, ApiResponsePayload, TokenPayload } from "../types/auth.types.js";
import { Request } from "express";
declare const setCookie: (cookieName: string, cookieValue: string, maxAge: number, res: Response) => void;
declare class ExpressValidation {
    basicAuthValidation: ValidationChain[];
    auth(type: "login" | "register"): ValidationChain[];
}
declare const checkAuthState: (req: Request, res: ApiResponse, tokenType: "accessToken" | "refreshToken") => Promise<ApiResponsePayload>;
declare const createToken: (type: "accessToken" | "refreshToken", payload: TokenPayload["accessToken"] | TokenPayload["refreshToken"]) => string;
declare const setUpTokens: (req: Request, res: ApiResponse, userPayload: {
    name: string;
    _id: string;
    email: string;
}) => void;
export { setCookie, ExpressValidation, checkAuthState, createToken, setUpTokens };
//# sourceMappingURL=auth.services.d.ts.map