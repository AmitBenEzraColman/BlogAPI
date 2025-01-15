import mongoose, { ObjectId } from "mongoose";

export interface IUser {
  _id?: ObjectId;
  email: string;
  password: string;
  refreshTokens?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  refreshTokens: {
    type: [String],
    required: false,
  },
});

export default mongoose.model<IUser>("User", userSchema);
