const { validationResult } = require('express-validator');
const Address = require('../models/Address');

const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { label, name, phone, city, area, street, landmark, latitude, longitude, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });

    const address = await Address.create({
      user: req.user._id,
      label,
      name,
      phone,
      city,
      area,
      street,
      landmark,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      isDefault: isDefault || existingCount === 0,
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { isDefault: false });
    }

    const fields = ['label', 'name', 'phone', 'city', 'area', 'street', 'landmark', 'latitude', 'longitude', 'isDefault'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) address[field] = req.body[field];
    });

    await address.save();
    res.json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    await address.deleteOne();
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress };