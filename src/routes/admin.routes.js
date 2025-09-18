import express from "express";
import {
  givePolicyEditPermissionToHr,
  removePolicyPermissionFromHr,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const adminRoutes = express.Router();

adminRoutes.patch(
  "/give-policy-access",
  authMiddleware,
  givePolicyEditPermissionToHr
);

adminRoutes.patch(
  "/remove-policy-access",
  authMiddleware,
  removePolicyPermissionFromHr
);

// adminRoutes.get("/", getAllStores);
// adminRoutes.get("/:id", getStoreById);
// adminRoutes.put("/:id", updateStore);
// adminRoutes.delete("/:id", deleteStore);

// adminRoutes.patch("/:id/:category/add", addItemToCategory); // add item
// adminRoutes.patch("/:id/:category/:index", updateItemInCategory); // update specific item
// adminRoutes.delete("/:id/:category/:index", removeItemFromCategory); // remove specific

export default adminRoutes;
