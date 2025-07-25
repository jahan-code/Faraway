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

  // primaryImage should exist (can be any type)
  primaryImage: Joi.any()
    .required()
    .messages({
      'any.required': 'Primary image is required',
    }),

  // galleryImages - no validation needed
  galleryImages: Joi.any(),

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
  badge: Joi.string().allow(''),
  
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
    type: Joi.string()
  .valid('crewed', 'bareboat')
  .required()
  .messages({
    'any.required': 'Yacht type is required',
    'any.only': 'Yacht type must be either crewed or bareboat',
  }),
  waterCapacity: Joi.string()
  .required()
  .messages({
     'any.required': 'Water capacity is required' 
    }),
  code: Joi.string().allow(''),
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