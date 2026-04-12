import User from "../../models/User/user.model.js";
import bycrpt from "bcrypt";
import dotenv from "dotenv";
import generateToken from "../../utils/jwt.js";
dotenv.config();
class AuthService {
  // Register
  async register(name, email, password) {
    const existing = await User.findOne({ email });
    
    // Check if user already exists
    if (existing) {
      throw new Error("User already exists");
    }
    if(password < 6 || password > 20){
      throw new Error("Password must be between 6 and 20 characters");
    }
    const hashedPassword = await bycrpt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    return {
      user_id: user._id,
      name,
      email,
      avatarId: user.avatarId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Login
  async login(email, password) {
    try {
      const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const isMatch = await bycrpt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    const generatedToken = await generateToken(user);
    user.token = generatedToken;
    return {
      user_id: user._id,
      name: user.name,
      email: user.email,
      avatarId: user.avatarId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: generatedToken
    };
    } catch (error) {
      console.log(error);
      throw error;
    }
  
  }

  async updateAvatar(userId, avatarId) {
    try {
      const user = await User.findById(userId);
      if (!user)  throw new Error("User not found");
      user.avatarId = avatarId;
      await user.save();
      return { message: "Avatar updated successfully"}
    }
      catch (error) {
        console.log(error);
        throw error;
      }
}
}
export default new AuthService();
