import jwt from 'jsonwebtoken';
import 'dotenv/config';

class TokenMiddleware {
  async generateAccessToken(payload) {
    try {
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '7d' });
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async generateAccessTokenResetPassword(payload) {
    try {
      const accessToken = jwt.sign(payload, process.env.RESET_TOKEN, { expiresIn: '5m' });
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async generateRefreshToken(payload) {
    try {
      const accessToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '365d' });
      return accessToken;
    } catch (error) {
      throw error;
    }
  }
}

export default new TokenMiddleware();
