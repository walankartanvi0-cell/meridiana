import bcrypt from "bcrypt";
import { Schema, model, type Document, type Model } from "mongoose";
import { USER_ROLES, type UserRole } from "../constants/roles";

export type UserStatus = "active" | "suspended";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  phone?: string;
  title?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means this field is not returned unless we ask for it.
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      required: true,
      default: "active",
    },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    title: { type: String, trim: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

// Hash the password before saving. This runs for create() and save().
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Extra protection in case a future query forgets to exclude the password.
userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete (returnedObject as { password?: string }).password;
    delete (returnedObject as { __v?: number }).__v;
    return returnedObject;
  },
});

userSchema.index({ role: 1 });

export const User = model<IUser, UserModel>("User", userSchema);
