export default function mapImageFilenamesToUrls(yacht, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
  // Handles both single yacht and array of yachts
  const mapFields = (item) => ({
    ...item.toObject(),
    primaryImage: item.primaryImage ? baseUrl + item.primaryImage : null,
    galleryImages: (item.galleryImages || []).map(filename => baseUrl + filename),
  });
  if (Array.isArray(yacht)) {
    return yacht.map(mapFields);
  } else {
    return mapFields(yacht);
  }
}