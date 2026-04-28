const mongoose = require("mongoose");
const Menu = require("../models/menuModel");
require("dotenv").config();

// Use your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dineflow";

// Copy your dishes from frontend constants
const startersItem = [
  { name: "Paneer Tikka", price: 250, category: "Starters", isAvailable: true },
  { name: "Chicken Tikka", price: 300, category: "Starters", isAvailable: true },
  { name: "Tandoori Chicken", price: 350, category: "Starters", isAvailable: true },
  { name: "Samosa", price: 100, category: "Starters", isAvailable: true },
  { name: "Aloo Tikki", price: 120, category: "Starters", isAvailable: true },
  { name: "Hara Bhara Kebab", price: 220, category: "Starters", isAvailable: true },
];

const mainCourse = [
  { name: "Butter Chicken", price: 400, category: "Main Course", isAvailable: true },
  { name: "Paneer Butter Masala", price: 350, category: "Main Course", isAvailable: true },
  { name: "Chicken Biryani", price: 450, category: "Main Course", isAvailable: true },
  { name: "Dal Makhani", price: 180, category: "Main Course", isAvailable: true },
  { name: "Kadai Paneer", price: 300, category: "Main Course", isAvailable: true },
  { name: "Rogan Josh", price: 500, category: "Main Course", isAvailable: true },
];

const beverages = [
  { name: "Masala Chai", price: 50, category: "Beverages", isAvailable: true },
  { name: "Lemon Soda", price: 80, category: "Beverages", isAvailable: true },
  { name: "Mango Lassi", price: 120, category: "Beverages", isAvailable: true },
  { name: "Cold Coffee", price: 150, category: "Beverages", isAvailable: true },
  { name: "Fresh Lime Water", price: 60, category: "Beverages", isAvailable: true },
  { name: "Iced Tea", price: 100, category: "Beverages", isAvailable: true },
];

const soups = [
  { name: "Tomato Soup", price: 120, category: "Soups", isAvailable: true },
  { name: "Sweet Corn Soup", price: 130, category: "Soups", isAvailable: true },
  { name: "Hot & Sour Soup", price: 140, category: "Soups", isAvailable: true },
  { name: "Chicken Clear Soup", price: 160, category: "Soups", isAvailable: true },
  { name: "Mushroom Soup", price: 150, category: "Soups", isAvailable: true },
  { name: "Lemon Coriander Soup", price: 110, category: "Soups", isAvailable: true },
];

const desserts = [
  { name: "Gulab Jamun", price: 100, category: "Desserts", isAvailable: true },
  { name: "Kulfi", price: 150, category: "Desserts", isAvailable: true },
  { name: "Chocolate Lava Cake", price: 250, category: "Desserts", isAvailable: true },
  { name: "Ras Malai", price: 180, category: "Desserts", isAvailable: true },
];

// Combine all dishes
const allDishes = [
  ...startersItem,
  ...mainCourse,
  ...beverages,
  ...soups,
  ...desserts,
];

async function seedMenu() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("Using URI:", MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    // Clear existing menu items
    const deleted = await Menu.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing menu items`);

    // Insert all dishes
    const inserted = await Menu.insertMany(allDishes);
    console.log(`✅ Added ${inserted.length} dishes to menu`);

    // List all categories
    const categories = [...new Set(allDishes.map(d => d.category))];
    console.log("Categories added:", categories.join(", "));

    console.log("\n🎉 Menu seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding menu:", error.message);
    process.exit(1);
  }
}

seedMenu();