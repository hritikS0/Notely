import AuthService from "./auth.service.js";

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async logout(req, res) {
    try {
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async updateAvatar(req, res) {
    try {
      const { avatarId } = req.body;
      const idToUpdate = req.userId;

      if (!idToUpdate) {
        return res.status(401).json({ message: "Not authorized" });
      }
      if (!avatarId) {
        return res.status(400).json({ message: "avatarId is required" });
      }
      const result = await AuthService.updateAvatar(idToUpdate, avatarId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
}
}
export default new AuthController();
