const Menu = require("../models/menuModel");

const getMenu = async (req, res, next) => {
  try {
    const items = await Menu.find({ isAvailable: true });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenu };