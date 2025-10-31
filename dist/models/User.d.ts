import { Model, Document } from "mongoose";
interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
type IUserDocument = Document & IUser;
type IUserQuery = IUserDocument | null;
type IUserModel = Model<IUser>;
declare const User: IUserModel;
export { User, IUserQuery, IUser, IUserDocument };
//# sourceMappingURL=User.d.ts.map