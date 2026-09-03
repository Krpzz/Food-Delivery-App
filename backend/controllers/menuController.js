const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const uploadImage = require('../utils/uploadImage');


const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(200).json({ success: true, category: existing, message: 'Category already existed' });
    }

    let image = '';
    if (req.file) {
      image = (await uploadImage(req.file.buffer, 'food-delivery-app/categories')).secure_url;
    }

    const category = await Category.create({ name, image });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};


const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    if (req.body.name) category.name = req.body.name;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.file) {
      category.image = (await uploadImage(req.file.buffer, 'food-delivery-app/categories')).secure_url;
    }
    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

const assertOwnsRestaurant = async (restaurantId, user) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    const err = new Error('Restaurant not found');
    err.statusCode = 404;
    throw err;
  }
  if (restaurant.owner.toString() !== user._id.toString() && user.role !== 'ADMIN') {
    const err = new Error('You do not own this restaurant');
    err.statusCode = 403;
    throw err;
  }
  return restaurant;
};

const getMenuItemsByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { category, availableOnly } = req.query;

    const filter = { restaurant: restaurantId };
    if (category) filter.category = category;
    if (availableOnly === 'true') filter.isAvailable = true;

    const menuItems = await MenuItem.find(filter).populate('category', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: menuItems.length, menuItems });
  } catch (error) {
    next(error);
  }
};

const getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, menuItem });
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { restaurant, category, name, description, price, discount, isVeg } = req.body;
    await assertOwnsRestaurant(restaurant, req.user);

    let image = '';
    if (req.file) {
      image = (await uploadImage(req.file.buffer, 'food-delivery-app/menu-items')).secure_url;
    }

    const menuItem = await MenuItem.create({
      restaurant,
      category: category || undefined,
      name,
      description,
      price,
      discount: discount || 0,
      isVeg: isVeg === 'true' || isVeg === true,
      image,
    });

    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    await assertOwnsRestaurant(menuItem.restaurant, req.user);

    const booleanFields = ['isVeg', 'isAvailable'];
    const fields = ['name', 'description', 'price', 'discount', 'category', ...booleanFields];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        menuItem[field] = booleanFields.includes(field)
          ? req.body[field] === 'true' || req.body[field] === true
          : req.body[field];
      }
    });

    if (req.file) {
      menuItem.image = (await uploadImage(req.file.buffer, 'food-delivery-app/menu-items')).secure_url;
    }

    await menuItem.save();
    res.json({ success: true, menuItem });
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    await assertOwnsRestaurant(menuItem.restaurant, req.user);

    await menuItem.deleteOne();
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItemsByRestaurant,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};