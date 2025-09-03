import Yacht from '../models/yacht.js';
import SuccessHandler from '../utils/SuccessHandler.js';
import ApiError from '../utils/ApiError.js';

import { getYachtByIdSchema, addyachtSchema, editYachtSchema } from '../validations/yacht.validation.js';
import paginate from '../utils/paginate.js';
import mapImageFilenamesToUrls from '../utils/mapImageFilenamesToUrls.js';
import { clearYachtCache } from '../utils/cache.js';

// Add a new yacht
export const addYacht = async (req, res, next) => {
  try {
    let yachtData = req.body;

    // Check if primary image is uploaded
    if (!req.files || !req.files.primaryImage || !req.files.primaryImage[0]) {
      return next(new ApiError('Primary image is required', 400));
    }

    // Get S3 URL from uploaded file (multer-s3 automatically uploads to S3)
    if (req.files && req.files.primaryImage && req.files.primaryImage[0]) {
      try {
        const file = req.files.primaryImage[0];
        
        // Check file size (max 12MB)
        const maxSize = 12 * 1024 * 1024; // 12MB in bytes
        if (file.size > maxSize) {
          return next(new ApiError(`Primary image file size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 12MB`, 400));
        }
        
        console.log(`📸 Primary image uploaded to S3: ${file.originalname}`);
        
        // The file.location contains the S3 URL (set by multer-s3)
        yachtData.primaryImage = file.location;
        console.log('✅ Primary image S3 URL:', yachtData.primaryImage);
      } catch (uploadError) {
        console.error('❌ Primary image upload failed');
        return next(new ApiError('Failed to upload primary image', 400));
      }
    }

    // Handle gallery images (multer-s3 automatically uploads to S3)
    const galleryImageFiles = [
      ...(req.files?.galleryImages || []),
      ...(req.files?.['galleryImages[]'] || []),
    ];
    
    console.log(`🖼️ Gallery images found: ${galleryImageFiles.length}`);
    
    if (galleryImageFiles.length > 0) {
      const galleryImageUrls = [];
      
              for (const file of galleryImageFiles) {
          try {
          // Check file size (max 12MB)
          const maxSize = 12 * 1024 * 1024;
            if (file.size > maxSize) {
            return next(new ApiError(`Gallery image file size exceeds maximum allowed size of 12MB`, 400));
          }
          
          // The file.location contains the S3 URL
          galleryImageUrls.push(file.location);
          console.log(`✅ Gallery image uploaded to S3: ${file.originalname}`);
          } catch (uploadError) {
            console.error('❌ Gallery image upload failed');
            return next(new ApiError('Failed to upload gallery image', 400));
          }
        }
      
      yachtData.galleryImages = galleryImageUrls;
    }

    // Validate yacht data
    const { error } = addyachtSchema.validate(yachtData);
    if (error) {
      return next(new ApiError(error.details[0].message, 400));
    }

    // Check if slug already exists
    if (yachtData.slug) {
      const slugExists = await Yacht.findOne({ slug: yachtData.slug });
      if (slugExists) {
        return next(new ApiError('Yacht with this slug already exists', 409));
      }
    }

    // Create the yacht
    const yacht = new Yacht(yachtData);
    await yacht.save();

    // Clear yacht cache
    await clearYachtCache();

    console.log('✅ Yacht created successfully');
    return SuccessHandler(yacht, 201, 'Yacht created successfully', res);

  } catch (err) {
    console.error('❌ Error creating yacht:', err);
    return next(new ApiError(err.message || 'Internal server error', 500));
  }
};

// Get all yachts
export const getAllYachts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);

    // Build query filter
    const filter = {};
    if (status && ['draft', 'published'].includes(status)) {
      filter.status = status;
    }

    // Use Promise.all for parallel execution
    const [yachts, total, recentlyUpdated] = await Promise.all([
      Yacht.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
        .exec(), // Use exec() for better performance
      Yacht.countDocuments(filter).exec(),
      // Recently updated (last 5)
      Yacht.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(5)
        .lean()
        .exec()
    ]);

    // Map image filenames to URLs and return yachts
    const yachtsWithUrls = mapImageFilenamesToUrls(yachts, req);
    
    const response = {
      yachts: yachtsWithUrls,
      page: Number(page),
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      recentlyUpdated
    };

    return SuccessHandler(
      response,
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
      return next(new ApiError(error.details[0].message, 400));
    }

    const { id } = req.query;
    
    // Use lean() for better performance and select only needed fields
    const yacht = await Yacht.findById(id)
      .lean()
      .exec();
      
    if (!yacht) {
      return next(new ApiError('Yacht not found', 404));
    }
    
    // Map image filenames to URLs and return yacht
    const yachtWithUrls = mapImageFilenamesToUrls(yacht, req);
    return SuccessHandler(yachtWithUrls, 200, 'Yacht fetched successfully', res);
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
    // Invalidate caches after delete
    await clearYachtCache();
    return SuccessHandler(null, 200, 'Yacht deleted successfully', res);
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

// Edit yacht by ID
export const editYacht = async (req, res, next) => {
  try {
    console.log('✏️ Edit yacht request received');

    const { id } = req.query;
    let yachtData = req.body;

    // Validate yacht ID
    const { error: idError } = getYachtByIdSchema.validate({ id });
    if (idError) {
      return next(new ApiError(idError.details[0].message, 400));
    }

    // Check if yacht exists
    const existingYacht = await Yacht.findById(id);
    if (!existingYacht) {
      return next(new ApiError('Yacht not found', 404));
    }

    // Handle primary image upload if provided (multer-s3 automatically uploads to S3)
    if (req.files && req.files.primaryImage && req.files.primaryImage[0]) {
      try {
        const file = req.files.primaryImage[0];
        
        // Check file size (max 12MB)
        const maxSize = 12 * 1024 * 1024;
        if (file.size > maxSize) {
          return next(new ApiError(`Primary image file size exceeds maximum allowed size of 12MB`, 400));
        }
        
        // The file.location contains the S3 URL
        yachtData.primaryImage = file.location;
        console.log('✅ Primary image updated successfully');
      } catch (uploadError) {
        return next(new ApiError(`Failed to upload primary image: ${uploadError.message}`, 400));
      }
    }

    // Handle gallery images upload if provided (multer-s3 automatically uploads to S3)
    const galleryImageFiles = [
      ...(req.files?.galleryImages || []),
      ...(req.files?.['galleryImages[]'] || []),
    ];
    
    if (galleryImageFiles.length > 0) {
      const newGalleryImages = [];
      for (const file of galleryImageFiles) {
        try {
          // Check file size (max 12MB)
          const maxSize = 12 * 1024 * 1024;
          if (file.size > maxSize) {
            return next(new ApiError(`Gallery image file size exceeds maximum allowed size of 12MB`, 400));
          }
          
          // The file.location contains the S3 URL
          newGalleryImages.push(file.location);
        } catch (uploadError) {
          return next(new ApiError(`Failed to upload gallery image: ${uploadError.message}`, 400));
        }
      }
      
      // If new gallery images are provided, replace the existing ones
      yachtData.galleryImages = newGalleryImages;
    }

    // Validate yacht data (make all fields optional for editing)
    const { error: validationError } = editYachtSchema.validate(yachtData);
    if (validationError) {
      return next(new ApiError(validationError.details[0].message, 400));
    }

    // If slug is being changed, ensure uniqueness
    if (yachtData.slug && yachtData.slug !== existingYacht.slug) {
      const slugExists = await Yacht.findOne({ 
        slug: yachtData.slug, 
        _id: { $ne: id } 
      });
      if (slugExists) {
        return next(new ApiError('Yacht with this slug already exists', 409));
      }
    }

    // Update the yacht
    const updatedYacht = await Yacht.findByIdAndUpdate(
      id,
      yachtData,
      { new: true, runValidators: true }
    );

    // Clear yacht cache
    await clearYachtCache();

    console.log('✅ Yacht updated successfully');
    return SuccessHandler(updatedYacht, 200, 'Yacht updated successfully', res);

  } catch (err) {
    console.error('❌ Error updating yacht:', err);
    return next(new ApiError(err.message || 'Internal server error', 500));
  }
};

// Update yacht status (publish/unpublish)
export const updateYachtStatus = async (req, res, next) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    // Validate yacht ID
    const { error: idError } = getYachtByIdSchema.validate({ id });
    if (idError) {
      return next(new ApiError(idError.details[0].message, 400));
    }

    // Validate status
    if (!status || !['draft', 'published'].includes(status)) {
      return next(new ApiError('Status must be either "draft" or "published"', 400));
    }

    // Check if yacht exists
    const existingYacht = await Yacht.findById(id);
    if (!existingYacht) {
      return next(new ApiError('Yacht not found', 404));
    }

    // Update the yacht status
    const updatedYacht = await Yacht.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Invalidate caches after status change
    await clearYachtCache();
    // Map image filenames to URLs and return updated yacht
    const yachtWithUrls = mapImageFilenamesToUrls(updatedYacht, req);
    return SuccessHandler(
      yachtWithUrls, 
      200, 
      `Yacht ${status === 'published' ? 'published' : 'unpublished'} successfully`, 
      res
    );
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

export default {
  addYacht,
  getAllYachts,
  getYachtById,
  deleteYacht,
  editYacht,
  updateYachtStatus,
}; 