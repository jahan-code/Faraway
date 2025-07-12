import Yacht from '../models/yacht.js';
import SuccessHandler from '../utils/SuccessHandler.js';
import ApiError from '../utils/ApiError.js';
import mapImageFilenamesToUrls from '../utils/mapImageFilenamesToUrls.js';
import { getYachtByIdSchema, addyachtSchema } from '../validations/yacht.validation.js';
import paginate from '../utils/paginate.js';
import { uploadToCloudinary } from '../utils/cloudinaryUtil.js';

// Add a new yacht
export const addYacht = async (req, res, next) => {
  try {
    console.log('🔍 addYacht called');
    console.log('📁 req.files:', req.files);
    console.log('📄 req.body:', req.body);
    
    const yachtData = req.body;

    // Upload primaryImage to Cloudinary
    if (req.files && req.files.primaryImage && req.files.primaryImage[0]) {
      console.log('📸 Processing primary image upload');
      try {
        const file = req.files.primaryImage[0];
        console.log('📁 Primary image file:', file);
        yachtData.primaryImage = await uploadToCloudinary(file.path, 'Faraway/yachts/primaryImage');
        console.log('☁️ Primary image uploaded to Cloudinary:', yachtData.primaryImage);
      } catch (uploadError) {
        console.error('❌ Primary image upload failed:', uploadError);
        return next(new ApiError(`Failed to upload primary image: ${uploadError.message}`, 400));
      }
    } else {
      console.log('❌ No primary image found in request');
      // If no primary image is uploaded, return an error
      return next(new ApiError('Primary image is required', 400));
    }

    // Upload galleryImages to Cloudinary
    if (req.files && req.files.galleryImages) {
      console.log('🖼️ Processing gallery images upload');
      yachtData.galleryImages = [];
      for (const file of req.files.galleryImages) {
        try {
          const url = await uploadToCloudinary(file.path, 'Faraway/yachts/galleryImages');
          yachtData.galleryImages.push(url);
        } catch (uploadError) {
          return next(new ApiError(`Failed to upload gallery image: ${uploadError.message}`, 400));
        }
      }
      console.log('☁️ Gallery images uploaded:', yachtData.galleryImages);
    }

    console.log('✅ Final yachtData before validation:', yachtData);

    // Now validate yachtData after file processing
    const { error } = addyachtSchema.validate(yachtData);
    if (error) {
      console.error('❌ Validation error:', error.details[0].message);
      return next(new ApiError(error.details[0].message, 400));
    }

    console.log('✅ Validation passed, creating yacht');
    const newYacht = await Yacht.create(yachtData);
    const yachtWithImageUrls = mapImageFilenamesToUrls(newYacht, req);
    return SuccessHandler(yachtWithImageUrls, 201, 'Yacht added successfully', res);
  } catch (err) {
    console.error('❌ addYacht error:', err);
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

export const deleteYacht = async (req, res, next) => {
  try {
    const { error } = getYachtByIdSchema.validate(req.query);
    if (error) {
      // You can use your ApiError class for consistency
      return next(new ApiError(error.details[0].message, 400));
    }

    const { id } = req.query;
    const yacht = await Yacht.findByIdAndDelete(id);
    if (!yacht) {
      return next(new ApiError('Yacht not found', 404));
    }
    return SuccessHandler(null, 200, 'Yacht deleted successfully', res);
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

export default {
  addYacht,
  getAllYachts,
  getYachtById,
  deleteYacht,
}; 