// ** Imports ** \\
import { Response, Request } from "express"
import { ValidationError } from "express-validator";


// ** Types (auth) ** \\
type ApiResponsePayload = {
    success: boolean;
    message: string;
    statusCode: number;
    error?: string;
    data?: unknown;
}

type ApiResponse = Response<ApiResponsePayload>;
type MiddlewareResponse = Promise<ApiResponse | undefined>;
type ControllerResponse = Promise<ApiResponse>;
type ExtendedValidationError = ValidationError & {
    path?: string;
    param?: string;
}

interface TokenPayload {
    accessToken: { userId: string; name: string; };
    refreshToken: Omit<TokenPayload["accessToken"], "name">;
}

interface ConfiguredRequest extends Request {
    data: unknown;
    accessTokenPayload: TokenPayload["accessToken"];
    refreshTokenPayload: TokenPayload["refreshToken"];
}

interface Credentials {
    register: { name: string; email: string; password: string; };
    login: Omit<Credentials["register"], "name">;
}

export {
    type ApiResponsePayload,
    type ApiResponse,
    type MiddlewareResponse,
    type ExtendedValidationError ,
    type ConfiguredRequest,
    type TokenPayload,
    type ControllerResponse,
    type Credentials
}