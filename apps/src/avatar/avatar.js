/**
 * Returns an avatar URL from the public/avatars folder.
 * It uses the provided ID to consistently return the same avatar for the same user.
 * 
 * @param {string|number} id - The unique identifier for the user (e.g., user._id, email, or name)
 * @param {number} totalAvatars - The total number of avatar images you have in the folder
 * @returns {string} The path to the avatar image
 */
export const getAvatarUrl = (id, totalAvatars = 10) => {
  // 🚨 CHANGE THIS EXTENSION to match the files in your public/avatars folder
  // Examples: '.svg', '.jpg', '.jpeg', '.webp'
  const extension = '.png'; 

  if (!id) {
    // If no ID is provided, return a random avatar
    const randomId = Math.floor(Math.random() * totalAvatars) + 1;
    return `/avatars/${randomId}${extension}`;
  }

  // If the user has specifically selected an avatarId (between 1 and totalAvatars), use it directly
  const numericId = Number(id);
  if (!isNaN(numericId) && numericId >= 1 && numericId <= totalAvatars && String(id).length <= 2) {
    return `/avatars/${numericId}${extension}`;
  }

  // Create a simple hash of the ID so the same user always gets the same avatar
  const strId = String(id);
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Map the hash to a number between 1 and totalAvatars
  const avatarId = Math.abs(hash % totalAvatars) + 1;
  return `/avatars/${avatarId}${extension}`;
};
