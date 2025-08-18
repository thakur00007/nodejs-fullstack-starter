import jwt from "jsonwebtoken";
import requestHandler from "../utility/requestHandeller.js";
import { User } from "../models/user.model.js";
import ApiError from "../utility/ApiError.js";

const authMiddleware = requestHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded.id) {
      throw new ApiError(401, "Unauthorized access");
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized access");
  }
});

export default authMiddleware;
