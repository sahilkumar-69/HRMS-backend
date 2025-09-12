import { emergencyContactModel } from "../../models/emergencyContact.js";

const addEmergencyDetails = async (eme_details) => {
  try {
    const { Name, Relationship, Phone } = eme_details;

    if (
      [Name, Relationship, Phone].some((ele) => {
        return ele == undefined || ele == ""
          ? true
          : ele?.trim() == ""
          ? true
          : false;
      })
    ) {
      return {
        success: false,
        message: "Emergency details aren't complete",
      };
    }

    const isDetailsSaved = await emergencyContactModel.create({
      Name: Name.trim(),
      Relationship: Relationship.trim(),
      Phone: Phone.trim(),
    });

    if (!isDetailsSaved) {
      return {
        success: false,
        message: "Can't save details to Database",
      };
    }

    return {
      success: true,
      message: "Saved in db",
      detailId: isDetailsSaved._id,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

const deleteEmergencyDetails = async (id) => {
  try {
    const isDetailDeleted = await emergencyContactModel.findOneAndDelete(id);

    if (!isDetailDeleted) {
      return {
        message: "Details not found",
        success: false,
      };
    }
    return {
      message: "Details deleted",
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
};

const updateEmergencyDetails = async (id, details) => {
  // const { Name, Relationship, Phone } = details;

  // if (
  //   [Name, Relationship, Phone].some((ele) => {
  //     return ele == undefined || ele == ""
  //       ? true
  //       : ele?.trim() == ""
  //       ? true
  //       : false;
  //   })
  // ) {
  //   return {
  //     success: false,
  //     message: "Emergency details aren't complete",
  //   };
  // }

  try {
    const updatedDetails = await emergencyContactModel.findByIdAndUpdate(
      id,
      {
        $set: details,
      },
      { new: true, runValidators: true }
    );

    if (!updatedDetails) {
      return {
        message: "Address not found or updated",
        success: false,
      };
    }

    return {
      message: "Address updated",
      id: updatedDetails._id,
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
};

export { addEmergencyDetails, deleteEmergencyDetails, updateEmergencyDetails };
