import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  const exixtedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (exixtedUser) {
    throw new ApiError(409, "User with email or username already exixts");
  }

  const avatarlocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
    coverImage: coverImage.url,
  });

  const createUser = User.findById(user._id).select("-password -refreshToken");
  if (!createUser) {
    throw new ApiError(500, "User registration failed");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createUser, "user registered successfully"));
});

export { registerUser };
