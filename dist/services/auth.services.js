import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { envData } from "../config/env.config.js";
import { writeOperation } from "./cache.services.js";
// ** Custom function to set a cookie for the requesting client ** \\
const setCookie = (cookieName, cookieValue, maxAge, res) => {
    res.cookie(cookieName, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge,
        path: "/api/v1"
    });
};
// ** Custom class to handle express validation ** \\
class ExpressValidation {
    constructor() {
        this.basicAuthValidation = [
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
    }
    auth(type) {
        if (type === "login") {
            return this.basicAuthValidation;
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
            ];
        }
        return [];
    }
}
// ** Custom class to handle token verification ** \\
const checkAuthState = async (req, res, tokenType) => {
    try {
        // ** Extract the users cookies ** \\
        const cookieWithToken = req.cookies[tokenType];
        // ** Check if the users cookies evn exist ** \\
        if (!cookieWithToken)
            return {
                success: false,
                message: "Unauthorized",
                statusCode: 401,
            };
        // ** If it does exist attach decoded payload to request ** \\
        const decoded = jwt.verify(cookieWithToken, envData[tokenType === "accessToken" ? "ACCESS_TOKEN_SECRET" : "REFRESH_TOKEN_SECRET"]);
        if (tokenType === "accessToken") {
            req.accessTokenPayload = decoded;
        }
        else {
            req.refreshTokenPayload = decoded;
        }
        return {
            success: true,
            message: "Token attached",
            statusCode: 200,
        };
    }
    catch (err) {
        // ** JWT error handling ** \\
        if (err instanceof jwt.JsonWebTokenError)
            return {
                success: false,
                message: "Invalid token",
                statusCode: 403,
                error: "Token error"
            };
        if (err instanceof jwt.TokenExpiredError)
            return {
                success: false,
                message: "Token has expired",
                statusCode: 403,
                error: "Token expired error"
            };
        // ** Server error handling ** \\
        return {
            success: false,
            message: "A server error occured while trying to verify your token",
            statusCode: 500,
            error: "Internal server error"
        };
    }
};
// ** Custom function to create a token ** \\
const createToken = (type, payload) => {
    if (type === "accessToken") {
        const typedPayload = payload;
        return jwt.sign(typedPayload, envData.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    }
    ;
    if (type === "refreshToken") {
        const typedPayload = payload;
        return jwt.sign(typedPayload, envData.REFRESH_TOKEN_SECRET, { expiresIn: "5d" });
    }
    ;
    return "";
};
// ** Custom function to setup tokens for users ** \\
const setUpTokens = (req, res, userPayload) => {
    const accessToken = createToken("accessToken", {
        userId: userPayload._id,
        name: userPayload.name,
    });
    const refreshToken = createToken("refreshToken", {
        userId: userPayload._id,
    });
    // ** Set cookies ** \\
    setCookie("accessToken", accessToken, 15 * 60 * 1000, res);
    setCookie("refreshToken", refreshToken, 5 * 24 * 60 * 60 * 1000, res);
    // ** Store the user in cache ** \\
    const cacheKey = `user:${userPayload._id}`;
    const cacheValue = {
        name: userPayload.name,
        _id: userPayload._id,
        email: userPayload.email,
    };
    writeOperation(cacheKey, cacheValue);
    return;
};
// ** Exports ** \\
export { setCookie, ExpressValidation, checkAuthState, createToken, setUpTokens };
//# sourceMappingURL=auth.services.js.map