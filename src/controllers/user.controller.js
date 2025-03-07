import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// this function is used to generate the access token and refresh token by taking parameter as user id from fnc call..
const generateAccessAndRefrenceTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // it will update the refresh token in the database
    user.refreshToken = refreshToken;
    // save is the mongoose method to save the data in the database
    await user.save({ validateBeforeSave: false });

    // return the access token and refresh token to the controller function i.e generateAccessAndRefrenceTokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate token");
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  //get user details from frontend
  // validation
  // check if user alredy exists username,email
  // check avatar and images
  //upload them to cloudinary,avatar
  //create use object - create entry in db
  //remove password and refresh token field from respone
  //check for user creation
  //respone res

  const { fullname, email, password, username } = req.body;
  console.log("email", email);

  // if(fullname === ""){
  //   throw new ApiError(400, 'Fullname is required')
  // }

  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const exixtedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exixtedUser) {
    throw new ApiError(409, "User with email or username already exixts");
  }

  const avatarlocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // let coverImageLocalPath;
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)
  // ) {
  //   coverImageLocalPath = req.files?.coverImage[0]?.path;
  // }

  if (!avatarlocalPath || !coverImageLocalPath) {
    throw new ApiError(400, "Avatar and cover image are required");
  }

  const avatar = await uploadOnCloudinary(avatarlocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar || !coverImage) {
    throw new ApiError(500, "Failed to upload image on cloudinary");
  }

  const user = await User.create({
    fullname,
    email,
    password,
    username,
    avatar: avatar.url,
    coverImage: coverImage.url || " ",
  });

  const createUser = User.findById(user._id).select("-password -refreshToken");
  if (!createUser) {
    throw new ApiError(500, "User registration failed");
  }
  console.log(createUser);
  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  // req body se data le aao
  // validation
  // user or email
  //find user
  //compare password or check
  //generate token
  //send cookie

  const { email, username, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // this  method is use to call the function generateAccessAndRefrenceTokens by passing the user id as a function argument
  const { accessToken, refreshToken } = await generateAccessAndRefrenceTokens(
    user._id
  );

  // cookies are used to store the token in the browser
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  }.status(200);
  res
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  // cookies remove kardo
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clear("refreshToken", options)
    .clear("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
