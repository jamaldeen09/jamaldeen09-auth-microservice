// ** Imports  ** \\
import { Request } from "express"
import { ApiResponse, ConfiguredRequest, ControllerResponse, Credentials, TokenPayload } from "../types/auth.types.js"
import { IUserQuery, User } from "../models/User.js";
import bcrypt from "bcrypt"
import { createToken, setCookie, setUpTokens } from "../services/auth.services.js";
import { deleteOperation, readOperation, writeOperation } from "../services/cache.services.js";

// ** Registration ** \\
const register = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract validated data attached to request ** \\
        const registrationCredentials = (req as ConfiguredRequest).data as Credentials["register"];

        // ** Check if the users account already exists ** \\
        const user = await User.exists({ email: registrationCredentials.email });
        if (user)
            return res.status(400).json({
                success: false,
                message: "Account already exists, please log in",
                statusCode: 400,
            });


        // ** If their account dosen't exist create a new account for them ** \\
        const newUser = await User.create({
            ...registrationCredentials,
            password: await bcrypt.hash(registrationCredentials.password, 12),
        });

        // ** Create tokens to attach to cookies and send to the requesting client ** \\
        setUpTokens(req, res, {
            name: newUser.name,
            _id: newUser._id,
            email: newUser.email
        });

        // ** Return a success response ** \\
        return res.status(201).json({
            success: true,
            message: "Account successfully created",
            statusCode: 201,
            data: { auth: { userId: newUser._id, name: newUser.name } }
        });
    } catch (err) {
        console.error(`Error occured in "register" controller in file "auth.controllers.ts": ${err}`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured during registration",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}

// ** Login ** \\
const login = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract validated data attached to request ** \\
        const loginCredentials = (req as ConfiguredRequest).data as Credentials["login"];

        // ** Check if the users account exists ** \\
        const user: IUserQuery = await User.findOne({ email: loginCredentials.email })
            .lean<IUserQuery>()
            .select("name _id email password");


        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found, please register",
                statusCode: 404,
                error: "Not found"
            });

        // ** Validate the users credentials (password) ** \\
        const isPasswordValid = await bcrypt.compare(loginCredentials.password, user.password);

        if (!isPasswordValid)
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
                statusCode: 400
            })

        // ** Create tokens to attach to cookies and send to the requesting client ** \\
        setUpTokens(req, res, {
            name: user.name,
            _id: user._id,
            email: user.email
        });

        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Account successfully logged into",
            statusCode: 200,
            data: { auth: { userId: user._id, name: user.name } }
        });
    } catch (err) {
        console.error(`Error occured in "login" controller in file "auth.controllers.ts": ${err}`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured during login process",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};

// ** Get an authenticated users auth state ** \\
const getAuth = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract user's id attached to request ** \\
        const requestingUsersId = ((req as ConfiguredRequest).accessTokenPayload).userId;

        // ** Check if the user exists in cache ** \\
        const cachedUser = readOperation(`user:${requestingUsersId}`);
        if (!cachedUser) {
            // ** Cache Miss ** \\
            // ** Check if the users account exists ** \\
            const user: IUserQuery = await User.findById(requestingUsersId)
                .lean<IUserQuery>()
                .select("name _id email");

            if (!user)
                return res.status(404).json({
                    success: false,
                    message: "Account was not found, please register",
                    statusCode: 404,
                    error: "Not found"
                });

            // ** Store the user in cache ** \\
            writeOperation<Omit<Credentials["register"], "password"> & { _id: string; }>(
                `user:${user._id}`,
                { name: user.name, _id: user._id, email: user.email },
            );

            // ** Return a success response ** \\
            return res.status(200).json({
                success: true,
                message: "Successfully fetches auth state",
                statusCode: 200,
                data: { auth: { userId: user._id, name: user.name } }
            });
        } else {
            const parsedUser = JSON.parse(cachedUser);

            // ** Return a success response ** \\
            return res.status(200).json({
                success: true,
                message: "Successfully fetches auth state",
                statusCode: 200,
                data: { auth: { userId: parsedUser._id, name: parsedUser.name } }
            });
        }
    } catch (err) {
        console.error(`Error occured in "getAuth" controller in file "auth.controllers.ts": ${err}`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your auth state",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}

// ** Refresh a users token ** \\
const refreshToken = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract user's id attached to request ** \\
        const requestingUsersId = ((req as ConfiguredRequest).refreshTokenPayload).userId;

        // ** Check if the users account exists ** \\
        const user: IUserQuery = await User.findById(requestingUsersId)
            .lean<IUserQuery>()
            .select("name _id email");

        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found, please register",
                statusCode: 404,
                error: "Not found"
            });

        // ** Prepare new access token ** \\
        const accessToken = createToken("accessToken", {
            userId: user._id,
            name: user.name,
        } as TokenPayload["accessToken"]);

        // ** Set cookie ** \\
        setCookie("accessToken", accessToken, 15 * 60 * 1000, res);

        // ** Store the user in cache ** \\
        writeOperation<Omit<Credentials["register"], "password"> & { _id: string; }>(
            `user:${user._id}`,
            { name: user.name, _id: user._id, email: user.email },
        );

        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            statusCode: 200,
            data: { auth: { userId: user._id, name: user.name } }
        });
    } catch (err) {
        console.error(`Error occured in "refreshToken" controller in file "auth.controllers.ts": ${err}`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to refresh your token",
            statusCode: 500,
            error: "Internal server error"
        })
    }
};

// ** Log a user out ** \\
const logout = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        const requestingUsersId = ((req as ConfiguredRequest).accessTokenPayload).userId;

        // ** Check if the users account exists ** \\
        const user: IUserQuery = await User.findById(requestingUsersId)
            .lean<IUserQuery>()
            .select("name _id email");

        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found, please register",
                statusCode: 404,
                error: "Not found"
            });

        // ** Clear the users cookies ** \\
        res.clearCookie("accessToken", { path: "/api/v1" });
        res.clearCookie("refreshToken", { path: "/api/v1" });
        deleteOperation(`user:${user._id}`);

        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Successfully logged out",
            statusCode: 200,
        })
    } catch (err) {
        console.error(`Error occured in "logout" controller in file "auth.controllers.ts": ${err}`);

        // ** Error handling ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to refresh your token",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}
export {
    register,
    login,
    getAuth,
    refreshToken,
    logout
}