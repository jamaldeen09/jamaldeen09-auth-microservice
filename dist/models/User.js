// ** Imports ** \\
import mongoose, { Schema } from "mongoose";
// ** Define actual schema ** \\
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true, },
}, { timestamps: true });
// ** Define model type ** \\
const User = mongoose.model("User", UserSchema);
// ** Exports ** \\
export { User };
//# sourceMappingURL=User.js.map