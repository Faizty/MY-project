/**
 * JWT utilities for token handling
 */

/**
 * Decode a JWT token without verification
 * @param {string} token - The JWT token to decode
 * @returns {object|null} The decoded token payload or null if invalid
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if the token is expired, false otherwise
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeJwt(token)
    if (!decoded || !decoded.exp) return true

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true
  }
}

/**
 * Get the remaining time in seconds before a token expires
 * @param {string} token - The JWT token to check
 * @returns {number} The remaining time in seconds, or 0 if expired/invalid
 */
export function getTokenRemainingTime(token) {
  try {
    const decoded = decodeJwt(token)
    if (!decoded || !decoded.exp) return 0

    const currentTime = Math.floor(Date.now() / 1000)
    const remainingTime = decoded.exp - currentTime

    return Math.max(0, remainingTime)
  } catch (error) {
    console.error("Error getting token remaining time:", error)
    return 0
  }
}

/**
 * Generate a JWT token
 * @param {object} user - The user object to encode in the token
 * @param {number} expiresIn - The number of seconds until the token expires (default: 600)
 * @returns {string} A JWT token
 */
export function generateJwt(user, expiresIn = 600) {
  // Create a header
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  // Create a payload with an expiration time
  const currentTime = Math.floor(Date.now() / 1000)
  const payload = {
    sub: user.id || `user_${Math.random().toString(36).substring(2, 15)}`,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: currentTime,
    exp: currentTime + expiresIn,
  }

  // Encode header and payload
  const encodeBase64 = (obj) => {
    return btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  }

  const encodedHeader = encodeBase64(header)
  const encodedPayload = encodeBase64(payload)

  // In a real implementation, you would sign this with a secret key
  // For this mock, we'll create a signature based on user data and timestamp
  const signature = btoa(`${user.id || ""}${user.email}${currentTime}`)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  // Combine to form the JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`
}
