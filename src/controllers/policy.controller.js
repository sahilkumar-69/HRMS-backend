import { policies } from "../models/policy.model.js";

const addPolicy = async (req, res) => {
  const body = req.body;

  const { Role } = req.user;
  try {
    if (!(Role === "ADMIN")) {
      return res.json({
        message: "Access denied",
        success: false,
      });
    }

    //   if(heading || subHeading || descriptions)
    const policy = await policies.create(body);

    policy
      ? res.json({ message: "Policy added", success: true, policy })
      : res.json({ message: "failed to add policy", success: false });
  } catch (error) {
    return res.json({
      message: error.message,
      success: false,
    });
  }
};


const updatePolicy = async (req, res) => {

  try {
    const policy = await policies.find();

    policy
      ? res.json({ message: "All Policy", success: true, policy })
      : res.json({ message: "failed to fetch policy", success: false });
  } catch (error) {
    return res.json({
      message: error.message,
      success: false,
    });
  }
};


const getPolicy = async (req, res) => {
  try {
    const policy = await policies.find();

    policy
      ? res.json({ message: "All Policy", success: true, policy })
      : res.json({ message: "failed to fetch policy", success: false });
  } catch (error) {
    return res.json({
      message: error.message,
      success: false,
    });
  }
};

export { addPolicy, updatePolicy, getPolicy };
