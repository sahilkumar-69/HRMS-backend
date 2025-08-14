
const userLogin = async (req, res) => {
  try {
    const { Phone, Password, Email } = req.body;

    if (!Phone && !Email) {
      return res.status(404).json({
        message: "Email or Phone is required",
      });
    }
    if (!Password || Password.length < 8) {
      return res.status(404).json({
        message: "Password is required and min 8 character required",
      });
    }

    const isExists = await isUserExists(Email, Phone);

    if (!isExists) {
      return res.status(404).json({
        success: true,
        message: "User not found please signup",
      });
    }

    // console.log(isExists);
    // console.table([isExists,Password])

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
        OrderHistory: isExists.OrderHistory,
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
