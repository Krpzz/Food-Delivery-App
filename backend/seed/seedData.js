
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
 
const CATEGORY_NAMES = [
  'Momo',
  'Newari Cuisine',
  'Thakali Set',
  'Noodles & Chowmein',
  'Fast Food',
  'Beverages',
  'Bakery & Desserts',
  'Indian',
  'Chinese',
  'Pizza & Burgers',
  'BBQ & Grill',
  'Breakfast',
];
 
const DISHES = {
  'Chicken Momo': { description: 'Steamed dumplings filled with minced chicken, served with tomato achar.', price: 220, isVeg: false, category: 'Momo' },
  'Buff Momo': { description: 'Kathmandu-style steamed buffalo momo with a spiced tomato dip.', price: 200, isVeg: false, category: 'Momo' },
  'Veg Momo': { description: 'Steamed dumplings filled with mixed vegetables and paneer.', price: 180, isVeg: true, category: 'Momo' },
  'Jhol Momo': { description: 'Steamed momo served in a tangy, spiced sesame-tomato broth.', price: 230, isVeg: false, category: 'Momo' },
  'Chili Momo': { description: 'Pan-fried momo tossed in a spicy chili-garlic sauce.', price: 240, isVeg: false, category: 'Momo' },
  'Chicken Chowmein': { description: 'Stir-fried noodles with chicken, cabbage and carrots.', price: 240, isVeg: false, category: 'Noodles & Chowmein' },
  'Veg Chowmein': { description: 'Stir-fried noodles with seasonal vegetables.', price: 200, isVeg: true, category: 'Noodles & Chowmein' },
  Thukpa: { description: 'Warm Himalayan noodle soup with vegetables and your choice of chicken.', price: 260, isVeg: false, category: 'Noodles & Chowmein' },
  'Dal Bhat Tarkari Set': { description: 'Steamed rice, lentil soup, seasonal vegetable curry, pickle and papad — unlimited refills.', price: 380, isVeg: true, category: 'Thakali Set' },
  'Chicken Thakali Set': { description: 'Traditional Thakali thali with chicken curry, rice, dal, greens and achar.', price: 480, isVeg: false, category: 'Thakali Set' },
  'Sekuwa Platter': { description: 'Charcoal-grilled marinated meat skewers served with beaten rice and pickle.', price: 450, isVeg: false, category: 'BBQ & Grill' },
  Choila: { description: 'Newari-style spiced, grilled buffalo meat tossed with mustard oil and herbs.', price: 320, isVeg: false, category: 'Newari Cuisine' },
  Bara: { description: 'Savory lentil patties, a Newari classic, pan-fried until crisp.', price: 220, isVeg: true, category: 'Newari Cuisine' },
  Chatamari: { description: 'Rice-flour crepe topped with egg, minced meat and spices — the "Newari pizza".', price: 280, isVeg: false, category: 'Newari Cuisine' },
  'Samay Baji Set': { description: 'Beaten rice served with choila, bara, soybeans and pickles.', price: 420, isVeg: false, category: 'Newari Cuisine' },
  Yomari: { description: 'Steamed rice-flour dumpling filled with molasses and sesame.', price: 90, isVeg: true, category: 'Bakery & Desserts' },
  'Sel Roti': { description: 'Traditional ring-shaped rice-flour doughnut, lightly sweetened.', price: 70, isVeg: true, category: 'Bakery & Desserts' },
  'Margherita Pizza': { description: 'Wood-fired pizza with tomato, mozzarella and fresh basil.', price: 550, isVeg: true, category: 'Pizza & Burgers' },
  'Chicken Pizza': { description: 'Wood-fired pizza topped with grilled chicken and bell peppers.', price: 620, isVeg: false, category: 'Pizza & Burgers' },
  'Classic Cheeseburger': { description: 'Grilled beef patty, cheddar, lettuce and house sauce in a toasted bun.', price: 320, isVeg: false, category: 'Pizza & Burgers' },
  'Veg Burger': { description: 'Crisp vegetable and paneer patty with lettuce and mayo.', price: 260, isVeg: true, category: 'Pizza & Burgers' },
  'French Fries': { description: 'Crispy salted fries served with ketchup.', price: 150, isVeg: true, category: 'Fast Food' },
  'Chicken Fried Rice': { description: 'Wok-tossed rice with chicken, egg and spring onion.', price: 260, isVeg: false, category: 'Chinese' },
  'Veg Fried Rice': { description: 'Wok-tossed rice with seasonal vegetables.', price: 220, isVeg: true, category: 'Chinese' },
  'Spring Rolls': { description: 'Crisp fried rolls filled with mixed vegetables, served with chili sauce.', price: 190, isVeg: true, category: 'Chinese' },
  'Butter Chicken': { description: 'Tender chicken simmered in a creamy tomato-butter gravy.', price: 420, isVeg: false, category: 'Indian' },
  'Paneer Butter Masala': { description: 'Cottage cheese cubes in a rich, mildly spiced tomato gravy.', price: 380, isVeg: true, category: 'Indian' },
  'Garlic Naan': { description: 'Tandoor-baked flatbread brushed with garlic butter.', price: 80, isVeg: true, category: 'Indian' },
  'Masala Tea': { description: 'Spiced milk tea, brewed strong.', price: 60, isVeg: true, category: 'Beverages' },
  Lassi: { description: 'Chilled, lightly sweetened yogurt drink.', price: 120, isVeg: true, category: 'Beverages' },
  'Fresh Lime Soda': { description: 'Sparkling soda with fresh lime, sweet or salted.', price: 100, isVeg: true, category: 'Beverages' },
  'Cold Coffee': { description: 'Blended iced coffee topped with a scoop of ice cream.', price: 180, isVeg: true, category: 'Beverages' },
  'Pancake Breakfast Set': { description: 'Fluffy pancakes with honey, butter and seasonal fruit.', price: 280, isVeg: true, category: 'Breakfast' },
  'Omelette with Toast': { description: 'Three-egg omelette with vegetables, served with buttered toast.', price: 220, isVeg: false, category: 'Breakfast' },
};
 

const RESTAURANTS = [
  { name: 'Newari Ghar', city: 'Kathmandu', address: 'Kirtipur Road, Kathmandu', phone: '014412201', cuisines: ['Newari', 'Local'], ownerIndex: 0, menu: ['Choila', 'Bara', 'Chatamari', 'Samay Baji Set', 'Yomari', 'Sel Roti'] },
  { name: 'Momo Point', city: 'Kathmandu', address: 'Putalisadak, Kathmandu', phone: '014223390', cuisines: ['Momo', 'Fast Food'], ownerIndex: 0, menu: ['Chicken Momo', 'Buff Momo', 'Veg Momo', 'Jhol Momo', 'Chili Momo', 'French Fries'] },
  { name: 'Thakali Kitchen', city: 'Lalitpur', address: 'Jawalakhel, Lalitpur', phone: '015521987', cuisines: ['Thakali', 'Nepali'], ownerIndex: 0, menu: ['Dal Bhat Tarkari Set', 'Chicken Thakali Set', 'Sekuwa Platter', 'Masala Tea', 'Lassi'] },
  { name: 'Everest Grill House', city: 'Kathmandu', address: 'Durbar Marg, Kathmandu', phone: '014261880', cuisines: ['BBQ', 'Continental'], ownerIndex: 1, menu: ['Sekuwa Platter', 'Classic Cheeseburger', 'Veg Burger', 'French Fries', 'Cold Coffee'] },
  { name: 'Spice Route', city: 'Pokhara', address: 'Lakeside, Pokhara', phone: '061465521', cuisines: ['Indian', 'Chinese'], ownerIndex: 1, menu: ['Butter Chicken', 'Paneer Butter Masala', 'Garlic Naan', 'Chicken Fried Rice', 'Veg Fried Rice', 'Spring Rolls'] },
  { name: 'Lakeside Bites', city: 'Pokhara', address: 'Lakeside Road, Pokhara', phone: '061466102', cuisines: ['Fast Food', 'Beverages'], ownerIndex: 1, menu: ['Classic Cheeseburger', 'Veg Burger', 'French Fries', 'Fresh Lime Soda', 'Cold Coffee', 'Masala Tea'] },
  { name: 'Bhaktapur Bhojanalaya', city: 'Bhaktapur', address: 'Durbar Square Road, Bhaktapur', phone: '016613347', cuisines: ['Newari', 'Local'], ownerIndex: 2, menu: ['Choila', 'Bara', 'Chatamari', 'Yomari', 'Dal Bhat Tarkari Set'] },
  { name: 'Golden Wok', city: 'Biratnagar', address: 'Main Road, Biratnagar', phone: '021470512', cuisines: ['Chinese', 'Noodles'], ownerIndex: 2, menu: ['Chicken Chowmein', 'Veg Chowmein', 'Thukpa', 'Chicken Fried Rice', 'Veg Fried Rice', 'Spring Rolls'] },
  { name: 'Sunrise Cafe & Bakery', city: 'Birtamode', address: 'Mahendra Marg, Birtamode', phone: '023540198', cuisines: ['Bakery', 'Breakfast'], ownerIndex: 2, menu: ['Pancake Breakfast Set', 'Omelette with Toast', 'Sel Roti', 'Cold Coffee', 'Masala Tea', 'Lassi'] },
  { name: 'Patan Darbar Kitchen', city: 'Lalitpur', address: 'Mangal Bazar, Lalitpur', phone: '015526754', cuisines: ['Newari', 'Local'], ownerIndex: 0, menu: ['Choila', 'Samay Baji Set', 'Chicken Thakali Set', 'Dal Bhat Tarkari Set', 'Sel Roti'] },
];
 
const OWNERS = [
  { name: 'Prakash Shrestha', email: 'prakash.shrestha@khajago.test', phone: '9801234561' },
  { name: 'Sunita Gurung', email: 'sunita.gurung@khajago.test', phone: '9801234562' },
  { name: 'Bikash Tamang', email: 'bikash.tamang@khajago.test', phone: '9801234563' },
];
 
const CUSTOMER_FIRST_NAMES = ['Aarav', 'Sita', 'Rohan', 'Kritika', 'Bikram', 'Anjali', 'Suresh', 'Priya', 'Nabin', 'Sarita', 'Dipesh', 'Manisha', 'Rajesh', 'Puja', 'Kiran', 'Sabina', 'Nirmal', 'Rekha', 'Sandip', 'Sunita'];
const CUSTOMER_LAST_NAMES = ['Shrestha', 'Maharjan', 'Rai', 'Gurung', 'Tamang', 'Thapa', 'KC', 'Adhikari', 'Basnet', 'Karki'];
 
const COUPONS = [
  { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10, minimumOrder: 500, maximumDiscount: 150, usageLimit: 500 },
  { code: 'FIRST50', discountType: 'FLAT', discountValue: 50, minimumOrder: 300, usageLimit: 1000 },
  { code: 'MOMO20', discountType: 'PERCENTAGE', discountValue: 20, minimumOrder: 400, maximumDiscount: 200, usageLimit: 300 },
  { code: 'FESTIVE100', discountType: 'FLAT', discountValue: 100, minimumOrder: 800, usageLimit: 200 },
  { code: 'WEEKEND15', discountType: 'PERCENTAGE', discountValue: 15, minimumOrder: 500, maximumDiscount: 250, usageLimit: 400 },
];
 
const DEFAULT_PASSWORD = 'Password123!';
 
const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');
 
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@fooddelivery.com.np',
        phone: '9800000000',
        password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
        role: 'ADMIN',
      });
      console.log(`Admin created: ${admin.email}`);
    } else {
      console.log(`Admin already exists: ${admin.email}`);
    }
 
    const existingRestaurantCount = await Restaurant.countDocuments();
    if (existingRestaurantCount > 0) {
      console.log(`${existingRestaurantCount} restaurants already exist — skipping demo data seed.`);
      console.log('Drop the restaurants/categories/menuitems/coupons collections first to reseed.');
      process.exit(0);
    }
 
    const ownerDocs = [];
    for (const owner of OWNERS) {
      ownerDocs.push(await User.create({ ...owner, password: DEFAULT_PASSWORD, role: 'RESTAURANT' }));
    }
    console.log(`Created ${ownerDocs.length} restaurant owners`);
 
    for (let i = 0; i < 20; i++) {
      const first = CUSTOMER_FIRST_NAMES[i % CUSTOMER_FIRST_NAMES.length];
      const last = CUSTOMER_LAST_NAMES[i % CUSTOMER_LAST_NAMES.length];
      await User.create({
        name: `${first} ${last}`,
        email: `customer${i + 1}@khajago.test`,
        phone: `98${(10000000 + i).toString().slice(0, 8)}`,
        password: DEFAULT_PASSWORD,
        role: 'CUSTOMER',
      });
    }
    console.log('Created 20 customers');
 
    const categoryDocs = {};
    for (const name of CATEGORY_NAMES) {
      categoryDocs[name] = await Category.create({ name });
    }
    console.log(`Created ${Object.keys(categoryDocs).length} categories`);
 
    let menuItemCount = 0;
    for (const r of RESTAURANTS) {
      const restaurant = await Restaurant.create({
        owner: ownerDocs[r.ownerIndex]._id,
        name: r.name,
        description: `${r.name} — serving ${r.cuisines.join(' & ')} food in ${r.city}.`,
        address: r.address,
        city: r.city,
        phone: r.phone,
        cuisines: r.cuisines,
        isApproved: true,
        isOpen: true,
        rating: Math.round((3.5 + Math.random() * 1.4) * 10) / 10,
        ratingCount: Math.floor(10 + Math.random() * 200),
      });
 
      for (const dishName of r.menu) {
        const dish = DISHES[dishName];
        await MenuItem.create({
          restaurant: restaurant._id,
          category: categoryDocs[dish.category]?._id,
          name: dishName,
          description: dish.description,
          price: dish.price,
          isVeg: dish.isVeg,
          isAvailable: true,
        });
        menuItemCount++;
      }
    }
    console.log(`Created ${RESTAURANTS.length} restaurants and ${menuItemCount} menu items`);
 
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);
    for (const coupon of COUPONS) {
      await Coupon.create({ ...coupon, expiryDate });
    }
    console.log(`Created ${COUPONS.length} coupons`);
 
    console.log('\nSeeding complete.\n');
    console.log(`Restaurant owner logins (all share one password: ${DEFAULT_PASSWORD}):`);
    ownerDocs.forEach((o) => console.log(`  ${o.email}`));
    console.log(`\nSample customer login: customer1@khajago.test / ${DEFAULT_PASSWORD}`);
 
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};
 

if (require.main === module) {
  run();
}
 
module.exports = { CATEGORY_NAMES, DISHES, RESTAURANTS, OWNERS, COUPONS, run };