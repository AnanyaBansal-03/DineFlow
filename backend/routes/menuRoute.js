const express = require("express");
const { 
  getMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require("../controllers/menuController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.get("/", isVerifiedUser, getMenu);
router.post("/", isVerifiedUser, addMenuItem);
router.put("/:id", isVerifiedUser, updateMenuItem);
router.delete("/:id", isVerifiedUser, deleteMenuItem);

module.exports = router;