// ** Imports ** \\
import { NextFunction } from "express";
import { ApiResponse, ConfiguredRequest, ExtendedValidationError, MiddlewareResponse } from "../types/auth.types";
import { matchedData, validationResult } from "express-validator";
import { Request } from "express";
import { checkAuthState } from "../services/auth.services.js";


// ** Verifies a requesting clients access token ** \\
const verifyAccessToken = async (
    req: Request,
    res: ApiResponse,
    next: NextFunction,
): Promise<ApiResponse | void> => {
    try {
        const tokenServiceResponse = await checkAuthState(req, res, "accessToken");
        if (!tokenServiceResponse.success) {
            return res.status(tokenServiceResponse.statusCode).json(tokenServiceResponse);
        } else { return next(); }
    } catch (err) {
        console.error(`Error occured in middleware "verifyAccessToken" in file "auth.middlewares.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to verify your token",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}

// ** Verifies a requesting clients refresh token ** \\
const verifyRefreshToken = async (
    req: Request,
    res: ApiResponse,
    next: NextFunction,
): Promise<ApiResponse | void> => {
    try {
        const tokenServiceResponse = await checkAuthState(req, res, "refreshToken");

        if (!tokenServiceResponse.success) {
            return res.status(tokenServiceResponse.statusCode).json(tokenServiceResponse);
        } else { return next(); }
    } catch (err) {
        console.error(`Error occured in middleware "verifyAccessToken" in file "auth.middlewares.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to verify your token",
            statusCode: 500,
            error: "Internal server error"
        });
    }
}

// ** Handles validation errors ** \\
const expressValidationHandler = async (
    req: Request,
    res: ApiResponse,
    next: NextFunction,
): MiddlewareResponse => {
    try {
        // ** Extract errors ** \\
        const errors = validationResult(req);

        // ** Check if there are any errors gracefully ** \\
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map((err: unknown) => {
                const e = err as ExtendedValidationError;
                return {
                    field: e.path ?? e.param ?? 'unknown',
                    message: e.msg,
                };
            });
            return res.status(400).json({
                success: false, message: "Validation error",
                statusCode: 400,
                data: { errors: formattedErrors }
            })
        }

        // ** If there are no errors attach matched data to req.data **
        (req as ConfiguredRequest).data = matchedData(req);
        next();
    } catch (err) {
        console.error("A server error occured in the express validation middleware: ", err);
        return res.status(500).json({
            success: false,
            message: "A server error occured during data validation",
            error: "Internal server error",
            statusCode: 500,
        })
    }
}

export {
    verifyAccessToken,
    verifyRefreshToken,
    expressValidationHandler
}