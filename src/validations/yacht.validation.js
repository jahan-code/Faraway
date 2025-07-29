import Joi from 'joi';

const addyachtSchema = Joi.object({
  boatType: Joi.string().required().messages({
    'string.base': 'Boat Type must be a string',
    'any.required': 'Boat Type is required',
  }),
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.base': 'Title must be a string',
  }),
  price: Joi.string()
  .required()
  .messages({
     'any.required': 'Price is required' 
    }),
  capacity: Joi.string()
  .required()
  .messages({
     'any.required': 'Category is required' 
    }),
  length: Joi.string()
  .required()
  .messages({
     'any.required': 'Length is required' 
    }),
  lengthRange: Joi.string().allow('').optional(),
  cabins: Joi.string()
  .required()
  .messages({
     'any.required': 'Cabins is required' 
    }),
  bathrooms: Joi.string()
  .required()
  .messages({
     'any.required': 'Bathrooms is required' 
    }),
  passengerDayTrip: Joi.string()
  .required()
  .messages({
     'any.required': 'Passenger Day Trip is required' 
    }),
  passengerOvernight: Joi.string()
  .required()
  .messages({
     'any.required': 'Passenger Overnight is required' 
    }),
  guests: Joi.string()
  .required()
  .messages({
     'any.required': 'Guests is required' 
    }),
  guestsRange: Joi.string()
  .required()
  .messages({
     'any.required': 'Guests Range is required' 
    }),
  dayTripPrice: Joi.string()
  .required()
  .messages({
     'any.required': 'Day Trip Price is required' 
    }),
  overnightPrice: Joi.string()
  .required()
  .messages({ 
    'any.required': 'Overnight Price is required' 
    }),
  daytripPriceEuro: Joi.string()
  .required()
  .messages({
     'any.required': 'Daytrip Price (Euro) is required' 
    }),

  // primaryImage should exist (can be any type)
  primaryImage: Joi.any()
    .required()
    .messages({
      'any.required': 'Primary image is required',
    }),

  // galleryImages - no validation needed
  galleryImages: Joi.any(),

  dayCharter: Joi.string().allow(''),
  overnightCharter: Joi.string().allow(''),
  aboutThisBoat: Joi.string().allow(''),
  specifications: Joi.string().allow(''),
  boatLayout: Joi.string().allow(''),
  videoLink: Joi.string().allow(''),
  badge: Joi.string().allow(''),
  
  design: Joi.string().allow('').optional(),
  built: Joi.string().allow('').optional(),
  cruisingSpeed: Joi.string().allow('').optional(),
  lengthOverall: Joi.string().allow('').optional(),
  fuelCapacity: Joi.string().allow('').optional(),
    type: Joi.string()
  .valid('crewed', 'bareboat')
  .required()
  .messages({
    'any.required': 'Yacht type is required',
    'any.only': 'Yacht type must be either crewed or bareboat',
  }),
  waterCapacity: Joi.string().allow('').optional(),
  code: Joi.string().allow('').optional(),
});

// No validation needed for getAllYachts
const getAllYachtsSchema = Joi.object({});

// For getYachtById, require 'id' as a string (in query or params)
const getYachtByIdSchema = Joi.object({
  id: Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
      'any.required': 'Yacht ID is required',
      'string.length': 'ID must be a valid.',
      'string.hex': 'ID must be a valid.'
    })
});
const deleteYachtSchema = Joi.object({
  id: Joi.string()
  .length(24)
  .hex()
  .required()
  .messages({
    'any.required': 'Yacht ID is required',
    'string.length': 'ID must be a valid.',
    'string.hex': 'ID must be a valid.'
  })
});

// Edit yacht schema - all fields are optional for partial updates
const editYachtSchema = Joi.object({
  boatType: Joi.string().optional().messages({
    'string.base': 'Boat type must be a string',
  }),
  title: Joi.string().optional().messages({
    'string.base': 'Title must be a string',
  }),
  price: Joi.string().optional(),
  capacity: Joi.string().optional(),
  length: Joi.string().allow('').optional(),
  lengthRange: Joi.string().allow('').optional(),
  cabins: Joi.string().optional(),
  bathrooms: Joi.string().optional(),
  passengerDayTrip: Joi.string().optional(),
  passengerOvernight: Joi.string().optional(),
  guests: Joi.string().optional(),
  guestsRange: Joi.string().optional(),
  dayTripPrice: Joi.string().optional(),
  overnightPrice: Joi.string().optional(),
  daytripPriceEuro: Joi.string().allow('').optional(),
  primaryImage: Joi.string().optional(),
  galleryImages: Joi.array().items(Joi.string()).optional(),
  dayCharter: Joi.string().allow('').optional(),
  overnightCharter: Joi.string().allow('').optional(),
  aboutThisBoat: Joi.string().allow('').optional(),
  specifications: Joi.string().allow('').optional(),
  boatLayout: Joi.string().allow('').optional(),
  videoLink: Joi.string().optional(),
  badge: Joi.string().allow('').optional(),
  design: Joi.string().optional(),
  built: Joi.string().optional(),
  cruisingSpeed: Joi.string().optional(),
  lengthOverall: Joi.string().optional(),
  fuelCapacity: Joi.string().optional(),
  waterCapacity: Joi.string().optional(),
  code: Joi.string().allow('').optional(),
  type: Joi.string()
    .valid('crewed', 'bareboat')
    .optional()
    .messages({
      'any.only': 'Yacht type must be either crewed or bareboat',
    }),
});

export { addyachtSchema, getAllYachtsSchema, getYachtByIdSchema, deleteYachtSchema, editYachtSchema };