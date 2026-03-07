const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

/* ---------------- ADD TABLE ---------------- */

const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;

    if (!tableNo) {
      return next(createHttpError(400, "Please provide table number"));
    }

    const isTablePresent = await Table.findOne({ tableNo });

    if (isTablePresent) {
      return next(createHttpError(400, "Table already exists"));
    }

    const newTable = new Table({
      tableNo,
      seats,
      currentOrder: null, // 🔥 no status field needed
    });

    await newTable.save();

    res.status(201).json({
      success: true,
      message: "Table added successfully!",
      data: newTable,
    });

  } catch (error) {
    next(error);
  }
};

/* ---------------- GET TABLES ---------------- */

const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().populate({
      path: "currentOrder",
      select: "customerDetails orderStatus",
    });

    res.status(200).json({
      success: true,
      data: tables,
    });

  } catch (error) {
    next(error);
  }
};

/* ---------------- UPDATE TABLE (OPTIONAL) ---------------- */

const updateTable = async (req, res, next) => {
  try {
    const { currentOrder } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid ID"));
    }

    const table = await Table.findByIdAndUpdate(
      id,
      { currentOrder },
      { new: true }
    );

    if (!table) {
      return next(createHttpError(404, "Table not found"));
    }

    res.status(200).json({
      success: true,
      message: "Table updated successfully!",
      data: table,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTable,
  getTables,
  updateTable,
};