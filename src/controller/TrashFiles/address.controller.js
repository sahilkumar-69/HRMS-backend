import { addressModel } from "../../models/address.js";

const addAddress = async (address) => {
  try {
    const { street, city, state, country, postalCode } = address;

    if (
      [street, city, state, country, postalCode].some((ele) => {
        return ele == undefined || ele == ""
          ? true
          : ele?.trim() == ""
          ? true
          : false;
      })
    ) {
      return {
        success: false,
        message: "Address isn't complete",
      };
    }

    const isAddressSaved = await addressModel.create({
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postalCode: postalCode.toString().trim(),
    });

    if (!isAddressSaved) {
      return {
        success: false,
        message: "Can't save Address to Database",
      };
    }

    return {
      success: true,
      message: "Saved in db",
      address: isAddressSaved._id,
    };
  } catch (error) {}
};

const deleteAddress = async (id) => {
  try {
    const isAddressDeleted = await addressModel.findOneAndDelete(id);

    if (!isAddressDeleted) {
      return {
        message: "address not find",
        success: false,
      };
    }
    return {
      message: "Address deleted",
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
};

const updateAddress = async (id, address) => {

  try {
    const updatedAddress = await addressModel.findByIdAndUpdate(
      id,
      {
        $set: address,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return {
        message: "Address not found or updated",
        success: false,
      };
    }

    return {
      message: "Address updated",
      id: updatedAddress._id,
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
};

export { addAddress, deleteAddress, updateAddress };
