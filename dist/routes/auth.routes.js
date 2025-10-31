// ** Imports ** \\
import express from "express";
import { expressValidationHandler, verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middlewares.js";
import { ExpressValidation } from "../services/auth.services.js";
import { getAuth, login, logout, refreshToken, register } from "../controllers/auth.controllers.js";
// ** Auth route definition ** \\
const authRouter = express.Router();
// ** Custom class for validation ** \\
const validationService = new ExpressValidation();
// ** Registration route ** \\
authRouter.post("/register", validationService.auth("register"), expressValidationHandler, register);
// ** Login route ** \\
authRouter.post("/login", validationService.auth("login"), expressValidationHandler, login);
// ** Get auth state ** \\
authRouter.get("/me", verifyAccessToken, getAuth);
// ** Refresh a users token ** \\
authRouter.get("/refresh", verifyRefreshToken, refreshToken);
// ** Log a user out ** \\
authRouter.post("/logout", verifyAccessToken, logout);
// ** Export ** \\
export default authRouter;
//# sourceMappingURL=auth.routes.js.map