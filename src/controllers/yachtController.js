import Yacht from '../models/yacht.js';
import SuccessHandler from '../utils/SuccessHandler.js';
import ApiError from '../utils/ApiError.js';
import mapImageFilenamesToUrls from '../utils/mapImageFilenamesToUrls.js';

// Add a new yacht
export const addYacht = async (req, res, next) => {
  try {
    const yachtData = req.body;
    if (req.files && req.files.length > 0) {
        yachtData.primaryImage = req.files.map(file => file.filename);
      }
    if (req.file) {
      yachtData.primaryImage = [req.file.filename];
    }
    const newYacht = await Yacht.create(yachtData);
    const yachtWithImageUrls = mapImageFilenamesToUrls(newYacht, req);
    return SuccessHandler(yachtWithImageUrls, 201, 'Yacht added successfully', res);
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

// Get all yachts
export const getAllYachts = async (req, res, next) => {
  try {
    const yachts = await Yacht.find();
    const yachtsWithUrls = mapImageFilenamesToUrls(yachts, req);
    return SuccessHandler(yachtsWithUrls, 200, 'Yachts fetched successfully', res);
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

// Get yacht by ID
export const getYachtById = async (req, res, next) => {
  try {
    const { id } = req.query;
    const yacht = await Yacht.findById(id);
    if (!yacht) {
      return next(new ApiError('Yacht not found', 404));
    }
    const yachtWithUrl = mapImageFilenamesToUrls(yacht, req);
    return SuccessHandler(yachtWithUrl, 200, 'Yacht fetched successfully', res);
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

export default {
  addYacht,
  getAllYachts,
  getYachtById,
}; 