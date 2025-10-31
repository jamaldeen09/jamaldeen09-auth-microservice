import { Request } from "express";
import { ApiResponse, ControllerResponse } from "../types/auth.types.js";
declare const register: (req: Request, res: ApiResponse) => ControllerResponse;
declare const login: (req: Request, res: ApiResponse) => ControllerResponse;
declare const getAuth: (req: Request, res: ApiResponse) => ControllerResponse;
declare const refreshToken: (req: Request, res: ApiResponse) => ControllerResponse;
declare const logout: (req: Request, res: ApiResponse) => ControllerResponse;
export { register, login, getAuth, refreshToken, logout };
//# sourceMappingURL=auth.controllers.d.ts.map