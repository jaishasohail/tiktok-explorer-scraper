'use strict';

/**
 * Normalize a raw TikTok hashtag / tag item.
 */
function normalizeHashtagItem(raw) {
 if (!raw) {
 throw new Error('Cannot normalize empty hashtag item');
 }

 const id =
 raw.id ||
 raw.tag_id ||
 (raw.challengeInfo && raw.challengeInfo.id) ||
 'unknown';

 const tag =
 raw.challengeInfo ||
 raw.tag ||
 raw;

 const stats =
 tag.stats ||
 raw.stats ||
 {};

 return {
 id: String(id),
 type: 'hashtag',
 name:
 tag.title ||
 tag.hashtagName ||
 tag.challengeName ||
 tag.name ||
 '',
 usageCount: Number(
 stats.viewCount ||
 stats.videos ||
 stats.postCount ||
 stats.videoCount ||
 0
 ),
 description: tag.desc || tag.description || '',
 url:
 raw.url ||
 (tag.title || tag.challengeName
 ? `https://www.tiktok.com/tag/${encodeURIComponent(
 (tag.title || tag.challengeName).replace(/^#/, '')
 )}`
 : null),
 };
}

/**
 * Generate deterministic mock hashtags for offline use.
 */
function generateMockHashtags(term, limit) {
 const safeTerm = term || 'tiktok';
 const count = Math.max(1, Math.min(limit || 10, 100));
 const items = [];

 for (let i = 0; i }
 */
function extractHashtags(apiResponse, context = {}) {
 const limit = context.limit || 25;
 let rawItems = [];

 if (apiResponse && typeof apiResponse === 'object') {
 if (Array.isArray(apiResponse.challengeList)) {
 rawItems = apiResponse.challengeList.map((c) => c.challengeInfo || c);
 } else if (apiResponse.data && Array.isArray(apiResponse.data.tags)) {
 rawItems = apiResponse.data.tags;
 } else if (Array.isArray(apiResponse.tags)) {
 rawItems = apiResponse.tags;
 }
 }

 if (!rawItems.length) {
 rawItems = generateMockHashtags(context.term, limit);
 }

 const sliced = rawItems.slice(0, limit);
 return sliced.map((item) => normalizeHashtagItem(item));
}

module.exports = {
 normalizeHashtagItem,
 extractHashtags,
};