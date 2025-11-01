// ** Imports ** \\
import { Response } from "express"
import { body, ValidationChain } from "express-validator"
import jwt from "jsonwebtoken"
import { ApiResponse, ApiResponsePayload, ConfiguredRequest, Credentials, TokenPayload } from "../types/auth.types.js";
import { Request } from "express";
import { envData } from "../config/env.config.js";
import { writeOperation } from "./cache.services.js";

// ** Custom function to set a cookie for the requesting client ** \\
const setCookie = (
    cookieName: string,
    cookieValue: string,
    maxAge: number,
    res: Response,

) => {
    res.cookie(cookieName, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge,
    });
}

// ** Custom class to handle express validation ** \\
class ExpressValidation {

    basicAuthValidation = [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email address must be provided")
            .isEmail()
            .withMessage("Invalid email address"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password must be provided")
            .isString()
            .withMessage("Password must be a string")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
            .matches(/.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~].*/)
            .withMessage("Password must contain at least 1 special character"),
    ];


    auth(type: "login" | "register"): ValidationChain[] {
        if (type === "login") {
            return this.basicAuthValidation
        }

        if (type === "register") {
            return [
                ...this.basicAuthValidation,
                body("name")
                    .trim()
                    .notEmpty()
                    .withMessage("Name must be provided")
                    .isString()
                    .withMessage("Name must be a string")
                    .isLength({ min: 2 })
                    .withMessage("Name must be at least 2 characters")
            ]
        }
        return []
    }
}

// ** Custom class to handle token verification ** \\

const checkAuthState = async (
    req: Request,
    res: Response,
    tokenType: "accessToken" | "refreshToken"
): Promise<ApiResponsePayload> => {
    try {
        // ** Extract token from headers instead of cookies ** \\
        const rawHeader =
            tokenType === "accessToken"
                ? req.headers.authorization
                : req.headers["x-refresh-token"];

        // ** Handle possible string[] header type ** \\
        const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

        if (!authHeader)
            return {
                success: false,
                message: "Unauthorized: Token missing",
                statusCode: 401,
            };

        // ** Split header format: "Bearer <token>" ** \\
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        if (!token)
            return {
                success: false,
                message: "Unauthorized: Invalid token format",
                statusCode: 401,
            };

        // ** Verify JWT ** \\
        const decoded = jwt.verify(
            token,
            tokenType === "accessToken"
                ? envData.ACCESS_TOKEN_SECRET
                : envData.REFRESH_TOKEN_SECRET
        ) as TokenPayload[typeof tokenType];

        // ** Attach decoded payload to request ** \\
        if (tokenType === "accessToken") {
            (req as ConfiguredRequest).accessTokenPayload = decoded as {
                userId: string;
                name: string;
            };
        } else {
            (req as ConfiguredRequest).refreshTokenPayload = decoded as {
                userId: string;
            }
        }

        return {
            success: true,
            message: "Token verified successfully",
            statusCode: 200,
        };
    } catch (err: unknown) {
        // ** Handle token expiration ** \\
        if (err instanceof jwt.TokenExpiredError)
            return {
                success: false,
                message: "Token expired",
                statusCode: 403,
                error: "TokenExpiredError",
            };

        // ** Handle malformed token ** \\
        if (err instanceof jwt.JsonWebTokenError)
            return {
                success: false,
                message: "Invalid token",
                statusCode: 403,
                error: "JsonWebTokenError",
            };

        // ** Catch-all for unexpected server errors ** \\
        console.error("JWT verification failed:", err);
        return {
            success: false,
            message: "Internal server error during token verification",
            statusCode: 500,
            error: "Internal server error",
        };
    }
};



// ** Custom function to create a token ** \\
const createToken = (
    type: "accessToken" | "refreshToken",
    payload: TokenPayload["accessToken"] | TokenPayload["refreshToken"]
): string => {
    if (type === "accessToken") {
        const typedPayload = payload as TokenPayload["accessToken"]
        return jwt.sign(typedPayload, envData.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    };

    if (type === "refreshToken") {
        const typedPayload = payload as TokenPayload["refreshToken"]
        return jwt.sign(typedPayload, envData.REFRESH_TOKEN_SECRET, { expiresIn: "5d" });
    };

    return "";
}

// ** Custom function to setup tokens for users ** \\
const setUpTokens = (
    req: Request,
    res: ApiResponse,
    userPayload: {
        name: string;
        _id: string;
        email: string;
    },
) => {

    const accessToken = createToken("accessToken", {
        userId: userPayload._id,
        name: userPayload.name,
    } as TokenPayload["accessToken"]);

    const refreshToken = createToken("refreshToken", {
        userId: userPayload._id,
    } as TokenPayload["refreshToken"]);


    // ** Store the user in cache ** \\
    const cacheKey = `user:${userPayload._id}`
    const cacheValue = {
        name: userPayload.name,
        _id: userPayload._id,
        email: userPayload.email,
    };

    writeOperation<Omit<Credentials["register"], "password"> & { _id: string; }>(cacheKey, cacheValue);
    return {
        accessToken,
        refreshToken,
    };
};

// ** Exports ** \\
export {
    setCookie,
    ExpressValidation,
    checkAuthState,
    createToken,
    setUpTokens
} 