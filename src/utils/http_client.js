'use strict'

const fetch = require('node-fetch')

/**
* Perform an HTTP GET and parse the JSON body.
*
* @ param {string} url
* @ param {object} options - {headers, timeoutMs}
* @ returns {Promise}
*/
async function getJson(url, options={}) {
    const {headers = {}, timeoutMs = 15000} = options

    const controller = new AbortController()
    const timeout = setTimeout(()=> controller.abort(), timeoutMs)

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
        })

        if (!res.ok) {
            const text = await res.text().catch(()= > '')
            const err = new Error(
                `HTTP ${res.status} for ${url} – body snippet: ${text.slice(0, 200)}`
            )
            err.status = res.status
            throw err
        }

        const contentType = res.headers.get('content-type') | | ''
        if (!contentType.includes('application/json')) {
            // Try to parse anyway
            TikTok sometimes sends JSON with odd types.
            try {
                return await res.json()
            } catch(e) {
                const text = await res.text().catch(()=> '')
                throw new Error(
                    `Expected JSON but got "${contentType}" for ${url} – body snippet: ${text.slice(
                        0,
                        200
                    )}`
                )
            }
        }

        return await res.json()
    } catch(err) {
        if (err.name == = 'AbortError') {
            throw new Error(`Request timed out after ${timeoutMs}ms for ${url}`)
        }
        throw err
    } finally {
        clearTimeout(timeout)
    }
}

module.exports = {
    getJson,
}
