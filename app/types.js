/**
 * @typedef {Object} Resume
 * @property {string} id
 * @property {string} [companyName]
 * @property {string} [jobTitle]
 * @property {string} imagePath
 * @property {string} resumePath
 * @property {Feedback} feedback
 */

/**
 * @typedef {Object} Feedback
 * @property {number} overallScore
 * @property {FeedbackCategory} ATS
 * @property {FeedbackCategory} toneAndStyle
 * @property {FeedbackCategory} content
 * @property {FeedbackCategory} structure
 * @property {FeedbackCategory} skills
 */

/**
 * @typedef {Object} FeedbackCategory
 * @property {number} score
 * @property {Tip[]} tips
 */

/**
 * @typedef {Object} Tip
 * @property {"good" | "improve"} type
 * @property {string} tip
 * @property {string} [explanation]
 */

/**
 * @typedef {Object} FSItem
 * @property {string} id
 * @property {string} uid
 * @property {string} name
 * @property {string} path
 * @property {boolean} is_dir
 * @property {string} parent_id
 * @property {string} parent_uid
 * @property {number} created
 * @property {number} modified
 * @property {number} accessed
 * @property {number | null} size
 * @property {boolean} writable
 */

/**
 * @typedef {Object} PuterUser
 * @property {string} uuid
 * @property {string} username
 */

/**
 * @typedef {Object} KVItem
 * @property {string} key
 * @property {string} value
 */

/**
 * @typedef {Object} ChatMessageContent
 * @property {"file" | "text"} type
 * @property {string} [puter_path]
 * @property {string} [text]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {"user" | "assistant" | "system"} role
 * @property {string | ChatMessageContent[]} content
 */

/**
 * @typedef {Object} PuterChatOptions
 * @property {string} [model]
 * @property {boolean} [stream]
 * @property {number} [max_tokens]
 * @property {number} [temperature]
 * @property {Array<{type: "function", function: {name: string, description: string, parameters: {type: string, properties: {}}}}>} [tools]
 */

/**
 * @typedef {Object} AIResponse
 * @property {number} index
 * @property {Object} message
 * @property {string} message.role
 * @property {string | any[]} message.content
 * @property {string | null} message.refusal
 * @property {any[]} message.annotations
 * @property {any | null} logprobs
 * @property {string} finish_reason
 * @property {Array<{type: string, model: string, amount: number, cost: number}>} usage
 * @property {boolean} via_ai_chat_service
 */

/**
 * @typedef {Object} PdfConversionResult
 * @property {string} imageUrl
 * @property {File | null} file
 * @property {string} [error]
 */

// Make Resume available globally
window.Resume = window.Resume || {};
window.Feedback = window.Feedback || {};
