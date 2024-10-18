import express from "express";
const router = express.Router();

import {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.mjs";
import verifyJWT from "../middleware/verifyJWT.mjs";

router.use(verifyJWT);
router
  .route("/")
  .get(getAllUsers)
  .post(createNewUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
