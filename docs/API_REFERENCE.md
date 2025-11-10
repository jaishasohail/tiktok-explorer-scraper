wn# TikTok Explorer Scraper – API Reference

This document describes the public surface of the TikTok Explorer Scraper.
The scraper is a Node.js CLI that reads a list of queries, calls TikTok
search endpoints, normalizes the results, and writes them as JSON.

---

## CLI

### Command

```bash
node src/index.js [options]

Or, using npm:
bashnpm start -- [options]

Options

-q, --queries 
Path to a queries.txt file.
Defaults to data/queries.txt.

-o, --output 
Path for the JSON output file.
Defaults to data/sample_output.json.

Query Format
Queries are defined in a plain text file, one per line:
textvideo:space exploration
user:elonmusk
hashtag:spacex

Supported types:

video – Search for videos by keyword.

user – Search for user profiles.

hashtag – Search for hashtags / challenges.

Lines starting with # are treated as comments and ignored.

Environment Variables (Cookies)
Some TikTok media URLs may only be accessible when valid cookies
are provided. You can optionally set these environment variables:

TIKTOK_TTWID

TIKTOK_TT_CHAIN_TOKEN

TIKTOK_TT_CSRF_TOKEN

When defined, they will be combined into a Cookie header for
all HTTP requests made by the scraper.

Extractors
video_parser

normalizeVideoItem(raw)
Normalizes a raw TikTok video object into a consistent structure.

extractVideos(apiResponse, context)
Extracts and normalizes a list of videos from the API response.
If the response is missing or malformed, it generates deterministic
mock data based on the context.term.

user_parser

normalizeUserItem(raw)
Normalizes a raw TikTok user object into a consistent structure.

extractUsers(apiResponse, context)
Parses user search responses and falls back to mock profiles when
the API is unavailable.

hashtag_parser

normalizeHashtagItem(raw)
Normalizes a raw TikTok hashtag / challenge object.

extractHashtags(apiResponse, context)
Parses hashtag search responses and falls back to mock tags when
needed.

HTTP Client
The HTTP client is implemented in src/utils/http_client.js and
exposes a single function:

getJson(url, options)

Performs an HTTP GET request and returns the parsed JSON body,
with basic timeout handling and error reporting.
pgsql
### tiktok-explorer-scraper/package.json
```json
{
 "name": "tiktok-explorer-scraper",
 "version": "1.0.0",
 "description": "A fast and flexible TikTok scraper for videos, users, hashtags, and more.",
 "main": "src/index.js",
 "scripts": {
 "start": "node src/index.js",
 "test": "jest --runInBand"
 },
 "keywords": [
 "tiktok",
 "scraper",
 "web-scraping",
 "crawler",
 "automation",
 "social-media",
 "data-extraction"
 },
 "author": "",
 "license": "MIT",
 "dependencies": {
 "node-fetch": "^2.6.7"
 },
 "devDependencies": {
 "jest": "^29.7.0"
 },
 "jest": {
 "testMatch": [
 "**/tests/**/*.js"
 ]
 }
}

tiktok-explorer-scraper/LICENSE
textMIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.