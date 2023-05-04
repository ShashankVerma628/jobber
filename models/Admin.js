import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide client's name"],
        trim: true,
        minLength: [4, "Name cannot be less than 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide client's email"],
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        trim: true,
        minLength: [4, "Password's length couldn't be less than 4 characters"],
        select: false
    },
    userRole: {
        type: String,
        default: "admin",
    }
}, { timestamps: true });

AdminSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

AdminSchema.methods.createJWT = function () {
    return jwt.sign({ userId: this._id, userRole: this.userRole }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

AdminSchema.methods.comparePassword = async function (adminPassword) {
    const isMatch = await bcrypt.compare(adminPassword, this.password);
    return isMatch;
}

export default mongoose.model("Client", AdminSchema);