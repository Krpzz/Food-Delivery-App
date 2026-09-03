const { validationResult } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const uploadImage = require('../utils/uploadImage');


const SORT_OPTIONS = {
  rating: { rating: -1 },
  newest: { createdAt: -1 },
  name: { name: 1 },
};

const getRestaurants = async (req, res, next) => {
  try {
    const { search, city, cuisine, isOpen, minRating, sort } = req.query;

    const filter = { isApproved: true };
    if (city) filter.city = new RegExp(`^${city}$`, 'i');
    if (cuisine) filter.cuisines = { $regex: cuisine, $options: 'i' };
    if (isOpen === 'true') filter.isOpen = true;
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(filter).sort(SORT_OPTIONS[sort] || SORT_OPTIONS.rating);
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    next(error);
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isApproved: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};


const getMyRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    next(error);
  }
};

const createRestaurant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, address, city, latitude, longitude, phone, cuisines, openingTime, closingTime } =
      req.body;

    let logo = '';
    let coverImage = '';
    if (req.files?.logo?.[0]) {
      logo = (await uploadImage(req.files.logo[0].buffer, 'food-delivery-app/restaurants')).secure_url;
    }
    if (req.files?.coverImage?.[0]) {
      coverImage = (await uploadImage(req.files.coverImage[0].buffer, 'food-delivery-app/restaurants')).secure_url;
    }

    const restaurant = await Restaurant.create({
      owner: req.user._id, // never trust a client-supplied owner (Section 20)
      name,
      description,
      address,
      city,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      phone,
      cuisines: cuisines ? cuisines.split(',').map((c) => c.trim()).filter(Boolean) : [],
      openingTime,
      closingTime,
      logo,
      coverImage,
    });

    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not own this restaurant' });
    }


    const editableFields = [
      'name',
      'description',
      'address',
      'city',
      'latitude',
      'longitude',
      'phone',
      'openingTime',
      'closingTime',
      'isOpen',
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) restaurant[field] = req.body[field];
    });

    if (req.body.cuisines !== undefined) {
      restaurant.cuisines = req.body.cuisines
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }

    if (req.files?.logo?.[0]) {
      restaurant.logo = (await uploadImage(req.files.logo[0].buffer, 'food-delivery-app/restaurants')).secure_url;
    }
    if (req.files?.coverImage?.[0]) {
      restaurant.coverImage = (
        await uploadImage(req.files.coverImage[0].buffer, 'food-delivery-app/restaurants')
      ).secure_url;
    }

    await restaurant.save();
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const isOwner = restaurant.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not own this restaurant' });
    }

  
    await MenuItem.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    res.json({ success: true, message: 'Restaurant and its menu items were deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getMyRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};