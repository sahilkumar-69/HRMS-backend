import express from "express";
import {
  getAllStores,
  getStoreById,
  updateStore,
  addItemToCategory,
  updateItemInCategory,
  deleteStore,
  removeItemFromCategory,
  addAdministrationEntrie,
} from "../controllers/administration.controller.js";
import { findUser } from "../middleware/findUser.js";

const administrationRoutes = express.Router();

administrationRoutes.post("/", findUser,addAdministrationEntrie);
administrationRoutes.get("/", getAllStores);
administrationRoutes.get("/:id", getStoreById);
administrationRoutes.put("/:id", updateStore);
administrationRoutes.delete("/:id", deleteStore);

administrationRoutes.patch("/:id/:category/add", addItemToCategory); // add item
administrationRoutes.patch("/:id/:category/:index", updateItemInCategory); // update specific item
administrationRoutes.delete("/:id/:category/:index", removeItemFromCategory); // remove specific

export default administrationRoutes;
