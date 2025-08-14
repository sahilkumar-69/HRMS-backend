import { isUserExists } from "../utils/IsUserExists.util";

const userLogin = async (req, res) => {
  try {
    const { Password, Email } = req.body;

    if (!Email) {
      return res.status(404).json({
        message: "Email is required",
      });
    }
    if (!Password || Password.length < 8) {
      return res.status(404).json({
        message: "Password is required and min 8 character required",
      });
    }

    const isExists = await isUserExists(Email);

    if (!isExists) {
      return res.status(404).json({
        success: true,
        message: "User not found please signup",
      });
    }

    const isPasswordMatch = await isExists.comparePassword(Password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "password don't match ",
      });
    }

    const accessToken = await isExists.generateAccessToken();

    return res.status(200).json({
      success: true,
      message: "logged in ",
      user: {
        Name: isExists.Name,
        Email: isExists.Email,
        Phone: isExists.Phone,
        Role: isExists.Role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("erron in log in ", error);
    return res.status(501).json({
      message: "internal server error",
    });
  }
};

export { userLogin };
