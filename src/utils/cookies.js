'use strict';

/**
 * Load TikTok-related cookies from environment variables.
 *
 * Supported env vars:
 * TIKTOK_TTWID
 * TIKTOK_TT_CHAIN_TOKEN
 * TIKTOK_TT_CSRF_TOKEN
 */
function loadCookiesFromEnv() {
 const cookies = {};

 if (process.env.TIKTOK_TTWID) {
 cookies.ttwid = process.env.TIKTOK_TTWID;
 }
 if (process.env.TIKTOK_TT_CHAIN_TOKEN) {
 cookies.tt_chain_token = process.env.TIKTOK_TT_CHAIN_TOKEN;
 }
 if (process.env.TIKTOK_TT_CSRF_TOKEN) {
 cookies.tt_csrf_token = process.env.TIKTOK_TT_CSRF_TOKEN;
 }

 return cookies;
}

/**
 * Build Cookie header value (e.g., "a=1; b=2").
 */
function buildCookieHeader(cookieMap) {
 if (!cookieMap || typeof cookieMap !== 'object') return '';

 const parts = [];
 for (const [key, value] of Object.entries(cookieMap)) {
 if (value !== undefined && value !== null && value !== '') {
 parts.push(`${key}=${value}`);
 }
 }
 return parts.join('; ');
}

module.exports = {
 loadCookiesFromEnv,
 buildCookieHeader,
};