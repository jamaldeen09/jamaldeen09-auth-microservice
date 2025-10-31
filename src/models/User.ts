// ** Imports ** \\
import mongoose, { Schema, Model, Document } from "mongoose"


// ** Define interface for mongoose schema to use as reference ** \\
interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// ** Define document and query type ** \\
type IUserDocument = Document & IUser;
type IUserQuery = IUserDocument | null;

// ** Define model type and static methods ** \\
type IUserModel = Model<IUser>;
 
// ** Define actual schema ** \\
const UserSchema = new Schema<IUser, IUserModel>({
    name: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true, },
},{ timestamps: true });

// ** Define model type ** \\
const User = mongoose.model<IUser, IUserModel>("User", UserSchema);

// ** Exports ** \\
export { User, IUserQuery, IUser, IUserDocument }