const Menu = require("../models/menuModel");
const createHttpError = require("http-errors");

// Get all menu items
const getMenu = async (req, res, next) => {
  try {
    const items = await Menu.find({ isAvailable: true }).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// Add new menu item (dish)
const addMenuItem = async (req, res, next) => {
  try {
    const { name, category, price, isAvailable } = req.body;

    // Validate required fields
    if (!name || !category || !price) {
      return next(createHttpError(400, "Name, category, and price are required"));
    }

    // Check if item already exists
    const existingItem = await Menu.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingItem) {
      return next(createHttpError(400, "Menu item already exists"));
    }

    const menuItem = new Menu({
      name,
      category,
      price: Number(price),
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    await menuItem.save();

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Update menu item
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, isAvailable } = req.body;

    const menuItem = await Menu.findById(id);
    if (!menuItem) {
      return next(createHttpError(404, "Menu item not found"));
    }

    if (name) menuItem.name = name;
    if (category) menuItem.category = category;
    if (price) menuItem.price = Number(price);
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await menuItem.save();

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// Delete menu item
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByIdAndDelete(id);
    
    if (!menuItem) {
      return next(createHttpError(404, "Menu item not found"));
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
};