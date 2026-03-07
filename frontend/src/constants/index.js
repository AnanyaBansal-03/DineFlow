import butterChicken from "../assets/images/butter-chicken-4.jpg";
import palakPaneer from "../assets/images/Saag-Paneer-1.jpg";
import biryani from "../assets/images/hyderabadibiryani.jpg";
import paneerTikka from "../assets/images/paneer-tika.webp";
import gulabJamun from "../assets/images/gulab-jamun.webp";
import pooriSabji from "../assets/images/poori-sabji.webp";
import roganJosh from "../assets/images/rogan-josh.jpg";

/* ------------------ MENU ITEMS ------------------ */

export const startersItem = [
  { id: "starter-1", name: "Paneer Tikka", price: 250, category: "Vegetarian", image: paneerTikka },
  { id: "starter-2", name: "Chicken Tikka", price: 300, category: "Non-Vegetarian", image: roganJosh },
  { id: "starter-3", name: "Tandoori Chicken", price: 350, category: "Non-Vegetarian", image: roganJosh },
  { id: "starter-4", name: "Samosa", price: 100, category: "Vegetarian", image: pooriSabji },
  { id: "starter-5", name: "Aloo Tikki", price: 120, category: "Vegetarian", image: pooriSabji },
  { id: "starter-6", name: "Hara Bhara Kebab", price: 220, category: "Vegetarian", image: paneerTikka }
];

export const mainCourse = [
  { id: "main-1", name: "Butter Chicken", price: 400, category: "Non-Vegetarian", image: butterChicken },
  { id: "main-2", name: "Paneer Butter Masala", price: 350, category: "Vegetarian", image: palakPaneer },
  { id: "main-3", name: "Chicken Biryani", price: 450, category: "Non-Vegetarian", image: biryani },
  { id: "main-4", name: "Dal Makhani", price: 180, category: "Vegetarian", image: palakPaneer },
  { id: "main-5", name: "Kadai Paneer", price: 300, category: "Vegetarian", image: palakPaneer },
  { id: "main-6", name: "Rogan Josh", price: 500, category: "Non-Vegetarian", image: roganJosh }
];

export const beverages = [
  { id: "beverage-1", name: "Masala Chai", price: 50, category: "Hot" },
  { id: "beverage-2", name: "Lemon Soda", price: 80, category: "Cold" },
  { id: "beverage-3", name: "Mango Lassi", price: 120, category: "Cold" },
  { id: "beverage-4", name: "Cold Coffee", price: 150, category: "Cold" },
  { id: "beverage-5", name: "Fresh Lime Water", price: 60, category: "Cold" },
  { id: "beverage-6", name: "Iced Tea", price: 100, category: "Cold" }
];

export const soups = [
  { id: "soup-1", name: "Tomato Soup", price: 120, category: "Vegetarian" },
  { id: "soup-2", name: "Sweet Corn Soup", price: 130, category: "Vegetarian" },
  { id: "soup-3", name: "Hot & Sour Soup", price: 140, category: "Vegetarian" },
  { id: "soup-4", name: "Chicken Clear Soup", price: 160, category: "Non-Vegetarian" },
  { id: "soup-5", name: "Mushroom Soup", price: 150, category: "Vegetarian" },
  { id: "soup-6", name: "Lemon Coriander Soup", price: 110, category: "Vegetarian" }
];

export const desserts = [
  { id: "dessert-1", name: "Gulab Jamun", price: 100, category: "Vegetarian", image: gulabJamun },
  { id: "dessert-2", name: "Kulfi", price: 150, category: "Vegetarian", image: gulabJamun },
  { id: "dessert-3", name: "Chocolate Lava Cake", price: 250, category: "Vegetarian" },
  { id: "dessert-4", name: "Ras Malai", price: 180, category: "Vegetarian" }
];

/* ------------------ MENUS ------------------ */

export const menus = [
  { id: "menu-1", name: "Starters", bgColor: "#b73e3e", icon: "🍲", items: startersItem },
  { id: "menu-2", name: "Main Course", bgColor: "#5b45b0", icon: "🍛", items: mainCourse },
  { id: "menu-3", name: "Beverages", bgColor: "#7f167f", icon: "🍹", items: beverages },
  { id: "menu-4", name: "Soups", bgColor: "#735f32", icon: "🍜", items: soups },
  { id: "menu-5", name: "Desserts", bgColor: "#1d2569", icon: "🍰", items: desserts }
];
export const itemsData = [
  { title: "Total Categories", value: "5", percentage: "12%", color: "#5b45b0", isIncrease: false },
  { title: "Total Dishes", value: "40", percentage: "12%", color: "#285430", isIncrease: true },
  { title: "Active Orders", value: "12", percentage: "12%", color: "#735f32", isIncrease: true },
  { title: "Total Tables", value: "15", color: "#7f167f" }
];

export const metricsData = [
  { title: "Revenue", value: "₹50,846.90", percentage: "12%", color: "#025cca", isIncrease: false },
  { title: "Outbound Clicks", value: "10,342", percentage: "16%", color: "#02ca3a", isIncrease: true },
  { title: "Total Customer", value: "19,720", percentage: "10%", color: "#f6b100", isIncrease: true },
  { title: "Event Count", value: "20,000", percentage: "10%", color: "#be3e3f", isIncrease: false }
];

export const orders = [
  {
    id: "101",
    customer: "Amrit Raj",
    status: "Ready",
    dateTime: "January 18, 2025 08:32 PM",
    items: 8,
    tableNo: 3,
    total: 250.0,
  },
  {
    id: "102",
    customer: "John Doe",
    status: "In Progress",
    dateTime: "January 18, 2025 08:45 PM",
    items: 5,
    tableNo: 4,
    total: 180.0,
  },
];