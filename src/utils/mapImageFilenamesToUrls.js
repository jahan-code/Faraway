export default function mapImageFilenamesToUrls(yacht, req) {
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    // Handles both single yacht and array of yachts
    if (Array.isArray(yacht)) {
      return yacht.map(item => ({
        ...item.toObject(),
        primaryImage: (item.primaryImage || []).map(filename => baseUrl + filename)
      }));
    } else {
      return {
        ...yacht.toObject(),
        primaryImage: (yacht.primaryImage || []).map(filename => baseUrl + filename)
      };
    }
  }