import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      Permissions: user.Permissions,
      Email: user.Email,
      Role: user.Role,
    },
    process.env.SECRET_TOKEN,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};
