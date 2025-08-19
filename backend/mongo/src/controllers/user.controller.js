import requestHandler from "../utility/requestHandeller.js";
import ApiError from "../utility/ApiError.js";
import ApiResponse from "../utility/ApiResponse.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = requestHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body.user;

  // Validate input
  if (!fullName || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email or username");
  }

  // Create user
  const newUser = await User.create({ fullName, username, email, password });

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", { user: newUser }));
});

const loginUser = requestHandler(async (req, res) => {
  const { username, email, password } = req.body.user;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const foundUser = await User.findOne(email ? { email } : { username });

  if (!foundUser) {
    throw new ApiError(404, "User not found with this email or username");
  }

  const isPasswordValid = await foundUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    foundUser._id
  );

  const loggedInUser = await User.findById(foundUser._id).select(
    "-password -refreshToken -createdAt -updatedAt"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(200, "Logged in successfully", {
        accessToken,
        refreshToken,
        user: loggedInUser,
      })
    );
});

const logoutUser = requestHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id);

  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "User logged out successfully"));
});

const getUserProfile = requestHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, "User profile fetched successfully", {
      user: req.user,
    })
  );
});

const refreshAccessToken = requestHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  refreshAccessToken,
};
