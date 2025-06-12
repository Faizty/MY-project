/**
 * Calculate the discounted price from original price and discount percentage
 * @param {number} originalPrice - The original price
 * @param {number} discountPercentage - The discount percentage (e.g., 20 for 20%)
 * @returns {number} The discounted price
 */
export function calculateDiscountedPrice(originalPrice, discountPercentage) {
  if (discountPercentage <= 0 || discountPercentage >= 100) {
    return originalPrice
  }

  // Formula: discountedPrice = originalPrice * (1 - discountPercentage/100)
  const discountedPrice = originalPrice * (1 - discountPercentage / 100)
  return Math.round(discountedPrice * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate the discount amount in currency
 * @param {number} originalPrice - The original price
 * @param {number} discountPercentage - The discount percentage
 * @returns {number} The discount amount in currency
 */
export function calculateDiscountAmount(originalPrice, discountPercentage) {
  const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage)
  return Math.round((originalPrice - discountedPrice) * 100) / 100
}

/**
 * Format price for display
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return price.toFixed(2)
}

/**
 * Calculate savings percentage
 * @param {number} originalPrice - The original price
 * @param {number} discountedPrice - The discounted price
 * @returns {number} The savings percentage
 */
export function calculateSavingsPercentage(originalPrice, discountedPrice) {
  if (originalPrice <= discountedPrice) return 0
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}
