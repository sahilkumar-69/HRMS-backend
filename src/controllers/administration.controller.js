import administration from "../models/administration.model.js";

//   Create a new AccessoryStore document
export const addAdministrationEntrie = async (req, res) => {
  try {
    const { type, data, category } = req.body;

    // console.log(req.body);
    if (!type)
      return res.status(404).json({
        success: false,
        message: "type field is required",
      });

    const newEntry = await administration.findOne();

    newEntry[type][category] = data;

    // console.log(newEntry);

    await newEntry.save();

    return res.json(newEntry);

    const newStore = new administration(req.body); // expects { accessories: [], services: [], miscellaneous: [] }
    const savedStore = await newStore.save();
    res.status(201).json(savedStore);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating store", error: error.message });
  }
};

//   Get all stores
export const getAllStores = async (req, res) => {
  try {
    const stores = await administration.find();
    res.status(200).json(stores);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stores", error: error.message });
  }
};

//   Get store by ID
export const getStoreById = async (req, res) => {
  try {
    const store = await administration.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.status(200).json(store);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching store", error: error.message });
  }
};

//   Update whole store (PUT)
export const updateStore = async (req, res) => {
  try {
    const updatedStore = await administration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStore)
      return res.status(404).json({ message: "Store not found" });
    res.status(200).json(updatedStore);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating store", error: error.message });
  }
};

//   Add item to a category (PATCH)
export const addItemToCategory = async (req, res) => {
  try {
    const { category } = req.params; // accessories | services | miscellaneous
    const { item } = req.body;

    const store = await administration.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!store[category])
      return res.status(400).json({ message: "Invalid category" });

    store[category].push(item);
    await store.save();

    res.status(200).json(store);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding item", error: error.message });
  }
};

//   Update specific item in a category (PATCH by index)
export const updateItemInCategory = async (req, res) => {
  try {
    const { category, index } = req.params;
    const { updatedItem } = req.body;

    const store = await administration.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!store[category])
      return res.status(400).json({ message: "Invalid category" });

    store[category][index] = { ...store[category][index]._doc, ...updatedItem };
    await store.save();

    res.status(200).json(store);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
};

//   Delete store by ID
export const deleteStore = async (req, res) => {
  try {
    const deletedStore = await administration.findByIdAndDelete(req.params.id);
    if (!deletedStore)
      return res.status(404).json({ message: "Store not found" });
    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting store", error: error.message });
  }
};

//   Remove item from category
export const removeItemFromCategory = async (req, res) => {
  try {
    const { category, index } = req.params;

    const store = await administration.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!store[category])
      return res.status(400).json({ message: "Invalid category" });

    store[category].splice(index, 1);
    await store.save();

    res.status(200).json(store);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
};
