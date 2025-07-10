import mongoose from 'mongoose';

const yachtSchema = new mongoose.Schema({
  boatType: { type: String, required: true }, // e.g., Power
  price: { type: String }, // e.g., Budget
  capacity: { type: String }, // e.g., Day Charter
  length: { type: String }, // e.g., 35sq
  lengthRange: { type: String, enum: ['< 40 ft', '40 To 60 ft', '60 To 80 ft', '> 80 ft'] },
  cabins: { type: String }, // e.g., 1
  bathrooms: { type: String }, // e.g., 2
  passengerDayTrip: { type: String }, // e.g., 1
  passengerOvernight: { type: String }, // e.g., 1
  guests: { type: String }, // e.g., 1
  guestsRange: { type: String }, // e.g., ≤6
  dayTripPrice: { type: String }, // e.g., 30,000 DTP
  overnightPrice: { type: String }, // e.g., 30,000 OP
  daytripPriceEuro: { type: String }, // e.g., 800 EUR
  daytripPriceTHB: { type: String }, // e.g., 800 THB
  daytripPriceUSD: { type: String }, // e.g., 800 USD
  primaryImage: { type: String }, // Single image filename/URL
  galleryImages: [{ type: String }], // Multiple image filenames/URLs
  priceEditor: { type: String }, // Rich text (HTML/Markdown) from editor
  tripDetailsEditor: { type: String }, // Rich text (HTML/Markdown) from editor
  dayCharter: { type: String }, // Rich text (HTML/Markdown)
  overnightCharter: { type: String }, // Rich text (HTML/Markdown)
  aboutThisBoat: { type: String }, // Rich text (HTML/Markdown)
  specifications: { type: String }, // Rich text (HTML/Markdown)
  boatLayout: { type: String }, // Rich text (HTML/Markdown)
  videoLink: { type: String }, // e.g., http://www.youtube.com
  videoLink2: { type: String },
  videoLink3: { type: String },
  badge: { type: String },
  yachtSpecifications: { type: String },
  design: { type: String },
  built: { type: String },
  cruisingSpeed: { type: String },
  lengthOverall: { type: String },
  fuelCapacity: { type: String },
  waterCapacity: { type: String },
  code: { type: String },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Yacht', yachtSchema);