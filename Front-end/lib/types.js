// This file contains type definitions as JSDoc comments for better code documentation

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} fullDescription
 * @property {number} price
 * @property {number} originalPrice
 * @property {number} discount
 * @property {string} image
 * @property {string[]} images
 * @property {string} category
 * @property {number} rating
 * @property {number} reviews
 * @property {number} stock
 * @property {string} createdAt
 * @property {Object} seller
 * @property {string} seller.id
 * @property {string} seller.name
 * @property {string} seller.joinDate
 * @property {string} seller.responseRate
 * @property {Array<{name: string, value: string}>} specifications
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} sellerId
 * @property {string} buyerId
 * @property {string} buyerName
 * @property {string} productId
 * @property {string} [productName]
 * @property {string} message
 * @property {string} timestamp
 * @property {boolean} isSellerReply
 * @property {boolean} [isRead]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} [avatar]
 * @property {string} [phone]
 * @property {string} [address]
 * @property {string} [bio]
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} userId
 * @property {string} type
 * @property {string} message
 * @property {string} timestamp
 * @property {boolean} isRead
 * @property {Object} [data]
 */

/**
 * @typedef {Object} WishlistItem
 * @property {string} id
 * @property {string} userId
 * @property {string} productId
 * @property {string} dateAdded
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} productId
 * @property {string} userId
 * @property {string} userName
 * @property {string} userAvatar
 * @property {number} rating
 * @property {string} comment
 * @property {string} title
 * @property {string} date
 * @property {boolean} verified
 * @property {number} helpfulCount
 * @property {string[]} images
 * @property {ReviewReply} [reply]
 */

/**
 * @typedef {Object} ReviewReply
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} userRole
 * @property {string} comment
 * @property {string} date
 */

/**
 * @typedef {Object} RatingsSummary
 * @property {number} average
 * @property {number} total
 * @property {Object.<string, number>} distribution
 */
