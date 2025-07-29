// Utility function to migrate old video link fields to new videoLinks array
export function migrateVideoLinks(yachtData) {
  const videoLinks = [];
  
  // Check for old video link fields and migrate them
  if (yachtData.videoLink && yachtData.videoLink.trim()) {
    videoLinks.push(yachtData.videoLink.trim());
  }
  if (yachtData.videoLink2 && yachtData.videoLink2.trim()) {
    videoLinks.push(yachtData.videoLink2.trim());
  }
  if (yachtData.videoLink3 && yachtData.videoLink3.trim()) {
    videoLinks.push(yachtData.videoLink3.trim());
  }
  
  // If new videoLinks array is provided, use it
  if (yachtData.videoLinks && Array.isArray(yachtData.videoLinks)) {
    return yachtData.videoLinks.filter(link => link && link.trim());
  }
  
  // Return migrated video links
  return videoLinks;
}

// Function to clean up old video link fields
export function cleanupOldVideoFields(yachtData) {
  const cleaned = { ...yachtData };
  delete cleaned.videoLink;
  delete cleaned.videoLink2;
  delete cleaned.videoLink3;
  return cleaned;
} 