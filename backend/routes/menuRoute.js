const express = require("express");
const { getMenu } = require("../controllers/menuController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.get("/", isVerifiedUser, getMenu);

module.exports = router;