import Yacht from '../models/yacht.js';
import SuccessHandler from '../utils/SuccessHandler.js';
import ApiError from '../utils/ApiError.js';
import mapImageFilenamesToUrls from '../utils/mapImageFilenamesToUrls.js';
import { getYachtByIdSchema, addyachtSchema } from '../validations/yacht.validation.js';
import paginate from '../utils/paginate.js';

// Add a new yacht
export const addYacht = async (req, res, next) => {
  try {
    const yachtData = req.body;
    if (req.files) {
      if (req.files.primaryImage && req.files.primaryImage.length > 0) {
        yachtData.primaryImage = req.files.primaryImage[0].filename;
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        yachtData.galleryImages = req.files.galleryImages.map(file => file.filename);
      }
    }
    // Now validate yachtData
    const { error } = addyachtSchema.validate(yachtData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
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
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);

    const yachts = await Yacht.find().skip(skip).limit(parsedLimit);
    const total = await Yacht.countDocuments();

    const yachtsWithUrls = mapImageFilenamesToUrls(yachts, req);
    return SuccessHandler(
      {
        yachts: yachtsWithUrls,
        page: Number(page),
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      },
      200,
      'Yachts fetched successfully',
      res
    );
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

// Get yacht by ID
export const getYachtById = async (req, res, next) => {
  try {
    // Validate the query using Joi
    const { error } = getYachtByIdSchema.validate(req.query);
    if (error) {
      // You can use your ApiError class for consistency
      return next(new ApiError(error.details[0].message, 400));
    }

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