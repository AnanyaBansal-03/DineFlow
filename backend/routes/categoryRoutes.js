const express = require("express");
const { 
  addCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory 
} = require("../controllers/categoryController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.post("/", isVerifiedUser, addCategory);
router.get("/", isVerifiedUser, getCategories);
router.put("/:id", isVerifiedUser, updateCategory);
router.delete("/:id", isVerifiedUser, deleteCategory);

module.exports = router;