import Joi from 'joi';

const addyachtSchema = Joi.object({
  boatType: Joi.string().required().messages({
    'string.base': 'Boat type must be a string',
    'any.required': 'Boat type is required',
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
  length: Joi.string()
  .required()
  .messages({
     'any.required': 'Length is required' 
    }),
  lengthRange: Joi.string()
  .valid('< 40 ft', '40 To 60 ft', '60 To 80 ft', '> 80 ft')
  .required()
  .messages({ 
    'any.required': 'Length range is required' 
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
  
  primaryImage: Joi.array()
  .items(
    Joi.string()).
  required()
  .messages({
     'any.required': 'At least one primary image is required' 
    }),

  priceEditor: Joi.string().
  required()
  .messages({
     'any.required': 'Price editor is required' 
    }),
  tripDetailsEditor: Joi.string()
  .required()
  .messages({
     'any.required': 'Trip details editor is required' 
    }),
  dayCharter: Joi.string()
  .required()
  .messages({
     'any.required': 'Day charter is required' 
    }),
  overnightCharter: Joi.string()
  .required().
  messages({
     'any.required': 'Overnight charter is required' 
    }),
  aboutThisBoat: Joi.string()
  .required().
  messages({ 
    'any.required': 'About this boat is required' 
  }),
  specifications: Joi.string()
  .required()
  .messages({
     'any.required': 'Specifications is required' 
    }),
  boatLayout: Joi.string()
  .required()
  .messages({
     'any.required': 'Boat layout is required' 
    }),
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
  yachtSpecifications: Joi.string()
  .required()
  .messages({
     'any.required': 'Yacht specifications is required' 
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
  id: Joi.string().required().messages({ 'any.required': 'Yacht ID is required' })
});

export { addyachtSchema, getAllYachtsSchema, getYachtByIdSchema };