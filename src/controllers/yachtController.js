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
    const yachtData = req.body;

    // Check if primary image is uploaded
    if (!req.files || !req.files.primaryImage || !req.files.primaryImage[0]) {
      return next(new ApiError('Primary image is required', 400));
    }

    // Upload primaryImage to Cloudinary
    if (req.files && req.files.primaryImage && req.files.primaryImage[0]) {
      try {
        const file = req.files.primaryImage[0];
        yachtData.primaryImage = await uploadToCloudinary(file.path, 'Faraway/yachts/primaryImage');
      } catch (uploadError) {
        return next(new ApiError(`Failed to upload primary image: ${uploadError.message}`, 400));
      }
    }

    // Upload galleryImages to Cloudinary
    const galleryImageFiles = [
      ...(req.files?.galleryImages || []),
      ...(req.files?.['galleryImages[]'] || []),
    ];
    
    console.log('🖼️ Gallery images found:', galleryImageFiles.length);
    console.log('📁 Gallery image files:', galleryImageFiles.map(f => ({ path: f.path, fieldname: f.fieldname, originalname: f.originalname })));
    
    if (galleryImageFiles.length > 0) {
      yachtData.galleryImages = [];
      for (const file of galleryImageFiles) {
        try {
          console.log('📸 Attempting to upload gallery image:', file.path);
          
          // Check if file exists
          const fs = await import('fs/promises');
          try {
            await fs.access(file.path);
            console.log('✅ Gallery image file exists:', file.path);
          } catch (accessError) {
            console.error('❌ Gallery image file does not exist:', file.path);
            console.error('❌ Access error:', accessError.message);
            return next(new ApiError(`Gallery image file not found: ${file.path}`, 500));
          }
          
          const url = await uploadToCloudinary(file.path, 'Faraway/yachts/galleryImages');
          yachtData.galleryImages.push(url);
          console.log('☁️ Gallery image uploaded successfully:', url);
        } catch (uploadError) {
          console.error('❌ Gallery image upload failed:', uploadError);
          return next(new ApiError(`Failed to upload gallery image: ${uploadError.message}`, 400));
        }
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

    const yachts = await Yacht.find().sort({ createdAt: -1 }).skip(skip).limit(parsedLimit);
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
}; 