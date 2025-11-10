'use strict';

/**
 * Normalize a raw TikTok user profile into consistent structure.
 */
function normalizeUserItem(raw) {
 if (!raw) {
 throw new Error('Cannot normalize empty user item');
 }

 const id =
 raw.id ||
 raw.user_id ||
 (raw.user && (raw.user.id || raw.user.user_id)) ||
 (raw.userInfo && raw.userInfo.user && raw.userInfo.user.id) ||
 'unknown';

 const user =
 raw.user ||
 (raw.userInfo && raw.userInfo.user) ||
 (raw.author && { uniqueId: raw.author.uniqueId }) ||
 raw;

 const stats =
 raw.stats ||
 (raw.userInfo && raw.userInfo.stats) ||
 user.stats ||
 raw.statistics ||
 {};

 return {
 id: String(id),
 type: 'user',
 username:
 user.uniqueId ||
 user.username ||
 user.nickname ||
 raw.uniqueId ||
 raw.username ||
 null,
 displayName: user.nickname || user.nicknameName || user.displayName || '',
 followers: Number(
 stats.followerCount ||
 stats.followers ||
 stats.fans ||
 stats.follower_count ||
 0
 ),
 following: Number(
 stats.followingCount ||
 stats.following ||
 stats.follow_count ||
 0
 ),
 likes: Number(
 stats.heartCount ||
 stats.total_favorited ||
 stats.likeCount ||
 0
 ),
 videos: Number(
 stats.videoCount ||
 stats.videos ||
 stats.aweme_count ||
 0
 ),
 bio:
 user.signature ||
 user.bio ||
 raw.signature ||
 '',
 avatarUrl:
 (user.avatarMedium && user.avatarMedium.urlList && user.avatarMedium.urlList[0]) ||
 user.avatarThumb ||
 user.avatarLarger ||
 user.avatarUrl ||
 null,
 url:
 raw.url ||
 (user.uniqueId
 ? `https://www.tiktok.com/@${user.uniqueId}`
 : null),
 };
}

/**
 * Generate deterministic mock user profiles for offline use.
 */
function generateMockUsers(term, limit) {
 const safeTerm = term || 'tiktok';
 const count = Math.max(1, Math.min(limit || 10, 100));
 const items = [];

 for (let i = 0; i }
 */
function extractUsers(apiResponse, context = {}) {
 const limit = context.limit || 25;
 let rawItems = [];

 if (apiResponse && typeof apiResponse === 'object') {
 if (Array.isArray(apiResponse.userList)) {
 rawItems = apiResponse.userList.map((u) => u.user || u);
 } else if (apiResponse.data && Array.isArray(apiResponse.data.users)) {
 rawItems = apiResponse.data.users;
 } else if (Array.isArray(apiResponse.users)) {
 rawItems = apiResponse.users;
 }
 }

 if (!rawItems.length) {
 rawItems = generateMockUsers(context.term, limit);
 }

 const sliced = rawItems.slice(0, limit);
 return sliced.map((item) => normalizeUserItem(item));
}

module.exports = {
 normalizeUserItem,
 extractUsers,
};