import Joi from 'joi';

const addyachtSchema = Joi.object({
  boatType: Joi.string().required().messages({
    'string.base': 'Boat type must be a string',
    'any.required': 'Boat type is required',
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
     'any.required': 'Capacity is required' 
    }),
  length: Joi.string().allow(''),
  lengthRange: Joi.string()
    .valid('< 40', '40 To 60', '60 To 80', '> 80')
    .required()
    .messages({
      'any.required': 'Length range is required',
      'any.only': 'Invalid length range value',
      'string.base': 'Length range must be a string',
    }),
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
     'any.required': 'Passenger day trip is required' 
    }),
  passengerOvernight: Joi.string()
  .required()
  .messages({
     'any.required': 'Passenger overnight is required' 
    }),
  guests: Joi.string()
  .required()
  .messages({
     'any.required': 'Guests is required' 
    }),
  guestsRange: Joi.string()
  .required()
  .messages({
     'any.required': 'Guests range is required' 
    }),
  dayTripPrice: Joi.string()
  .required()
  .messages({
     'any.required': 'Day trip price is required' 
    }),
  overnightPrice: Joi.string()
  .required()
  .messages({ 
    'any.required': 'Overnight price is required' 
    }),
  daytripPriceEuro: Joi.string().allow(''),
  daytripPriceTHB: Joi.string().allow(''),
  daytripPriceUSD: Joi.string().allow(''),

  // primaryImage should be a string, not an array
  primaryImage: Joi.string()
    .messages({
      'string.base': 'Primary image must be a string',
    }),

  // galleryImages should be an array of strings (optional)
  galleryImages: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Gallery images must be an array of strings',
      'string.base': 'Each gallery image must be a string',
    }),

  priceEditor: Joi.string().allow(''),
  tripDetailsEditor: Joi.string().allow(''),
  dayCharter: Joi.string().allow(''),
  overnightCharter: Joi.string().allow(''),
  aboutThisBoat: Joi.string().allow(''),
  specifications: Joi.string().allow(''),
  boatLayout: Joi.string().allow(''),
  videoLink: Joi.string()
  .required()
  .messages({
     'any.required': 'Video link is required' 
    }),
  videoLink2: Joi.string().allow(''),
  videoLink3: Joi.string().allow(''),
  badge: Joi.string()
  .required()
  .messages({
     'any.required': 'Badge is required' 
    }),
  design: Joi.string()
  .required()
  .messages({
     'any.required': 'Design is required'
     }),
  built: Joi.string()
  .required()
  .messages({
     'any.required': 'Built is required' 
    }),
  cruisingSpeed: Joi.string()
  .required()
  .messages({
     'any.required': 'Cruising speed is required' 
    }),
  lengthOverall: Joi.string()
  .required()
  .messages({
     'any.required': 'Length overall is required' 
    }),
  fuelCapacity: Joi.string()
  .required()
  .messages({
     'any.required': 'Fuel capacity is required' 
    }),
  waterCapacity: Joi.string()
  .required()
  .messages({
     'any.required': 'Water capacity is required' 
    }),
  code: Joi.string()
  .required()
  .messages({
     'any.required': 'Code is required' 
    }),
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
export { addyachtSchema, getAllYachtsSchema, getYachtByIdSchema,deleteYachtSchema };