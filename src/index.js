'use strict';

const fs = require('fs');
const path = require('path');
const {extractVideos} = require('./extractors/video_parser');
const {extractUsers} = require('./extractors/user_parser');
const {extractHashtags} = require('./extractors/hashtag_parser');
const {getJson} = require('./utils/http_client');
const {buildCookieHeader, loadCookiesFromEnv} = require('./utils/cookies');

const DEFAULT_QUERIES_PATH = path.join(__dirname, '..', 'data', 'queries.txt');
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '..', 'data', 'sample_output.json');
const DEFAULT_CONFIG_PATH = path.join(__dirname, 'config', 'settings.example.json');

/**
 * Safely load JSON config.
 */
function loadConfig(configPath=DEFAULT_CONFIG_PATH) {
 try {
 const raw = fs.readFileSync(configPath, 'utf8');
 return JSON.parse(raw);
 } catch(err) {
 console.warn(`[config] Failed to load config at ${configPath}, using defaults.`, err.message);
 return {
 baseUrls: {
 videoSearch: 'https://www.tiktok.com/api/search/general/full/',
 userSearch: 'https://www.tiktok.com/api/search/user/full/',
 hashtagSearch: 'https://www.tiktok.com/api/search/tag/full/',
 },
 defaultLimit: 25,
 userAgent:
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
 '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
 timeoutMs: 15000,
 };
 }
}

/**
 * Parse a single query line in the format:
 * video: spaceX rockets
 * user: elonmusk
 * hashtag: spacex
 */
function parseQueryLine(line) {
 const trimmed = line.trim();
 if (!trimmed | | trimmed.startsWith('#')) return null;

 const idx = trimmed.indexOf(':');
 if (idx === -1) {
 throw new Error(`Invalid query line(missing type: prefix): "${line}"`);
 }

 const type = trimmed.slice(0, idx).trim().toLowerCase();
 const term = trimmed.slice(idx + 1).trim();

 if (!type | | !term) {
 throw new Error(`Invalid query line(empty type or term): "${line}"`);
 }

 if (!['video', 'user', 'hashtag'].includes(type)) {
 throw new Error(`Unsupported query type "${type}" in line "${line}"`);
 }

 return {type, term};
}

/**
 * Load queries from a text file.
 */
function loadQueries(filePath=DEFAULT_QUERIES_PATH) {
 const content = fs.readFileSync(filePath, 'utf8');
 const lines = content.split(/\r?\n/);
 const queries = [];

 for (const line of lines) {
 const parsed = parseQueryLine(line);
 if (parsed) {
 queries.push(parsed);
 }
 }

 return queries;
}

/**
 * Build TikTok API URL based on query type.
 */
function buildSearchUrl(config, query) {
 const { type, term } = query;
 const encoded = encodeURIComponent(term);
 const limit = config.defaultLimit || 25;

 switch (type) {
 case 'video':
 return `${config.baseUrls.videoSearch}?keyword=${encoded}&count=${limit}`;
 case 'user':
 return `${config.baseUrls.userSearch}?keyword=${encoded}&count=${limit}`;
 case 'hashtag':
 return `${config.baseUrls.hashtagSearch}?keyword=${encoded}&count=${limit}`;
 default:
 throw new Error(`Unsupported query type: ${type}`);
 }
}

/**
 * Execute all queries: call HTTP API (or fall back to mock data)
 * and normalize the results.
 */
async function runQueries(queries, config, extraOptions = {}) {
 const results = [];
 const cookies = loadCookiesFromEnv();
 const cookieHeader = buildCookieHeader(cookies);

 for (const query of queries) {
 const url = buildSearchUrl(config, query);
 let responseJson = null;

 console.log(`[scraper] Executing ${query.type} query "${query.term}"`);
 try {
 responseJson = await getJson(url, {
 timeoutMs: config.timeoutMs,
 headers: {
 'User-Agent': config.userAgent,
 Cookie: cookieHeader || undefined,
 'Accept-Language': 'en-US,en;q=0.9',
 },
 });
 } catch (err) {
 console.warn(
 `[scraper] Request failed for query "${query.term}" (${query.type}): ${err.message}. ` +
 'Falling back to mock data.'
 );
 }

 let normalized = [];
 const context = {
 term: query.term,
 limit: config.defaultLimit || 25,
 };

 switch (query.type) {
 case 'video':
 normalized = extractVideos(responseJson, context);
 break;
 case 'user':
 normalized = extractUsers(responseJson, context);
 break;
 case 'hashtag':
 normalized = extractHashtags(responseJson, context);
 break;
 default:
 // This should never happen due to earlier validation.
 break;
 }

 results.push(...normalized);
 }

 return results;
}

/**
 * Write results as pretty JSON.
 */
function writeResults(filePath, records) {
 const dir = path.dirname(filePath);
 if (!fs.existsSync(dir)) {
 fs.mkdirSync(dir, { recursive: true });
 }

 const json = JSON.stringify(records, null, 2);
 fs.writeFileSync(filePath, json, 'utf8');
 console.log(`[scraper] Wrote ${records.length} records to ${filePath}`);
}

/**
 * CLI entry.
 */
async function main() {
 const config = loadConfig();
 const args = process.argv.slice(2);

 let queriesPath = DEFAULT_QUERIES_PATH;
 let outputPath = DEFAULT_OUTPUT_PATH;

 for (let i = 0; i }
 */
function extractVideos(apiResponse, context = {}) {
 const limit = context.limit || 25;
 let rawItems = [];

 if (apiResponse && typeof apiResponse === 'object') {
 // Support several possible response shapes.
 if (Array.isArray(apiResponse.itemList)) {
 rawItems = apiResponse.itemList;
 } else if (apiResponse.data && Array.isArray(apiResponse.data.videos)) {
 rawItems = apiResponse.data.videos;
 } else if (
 apiResponse.aweme_list &&
 Array.isArray(apiResponse.aweme_list)
 ) {
 rawItems = apiResponse.aweme_list;
 } else if (Array.isArray(apiResponse.videos)) {
 rawItems = apiResponse.videos;
 }
 }

 if (!rawItems.length) {
 rawItems = generateMockVideos(context.term, limit);
 }

 const sliced = rawItems.slice(0, limit);
 return sliced.map((item) => normalizeVideoItem(item));
}

module.exports = {
 normalizeVideoItem,
 extractVideos,
};