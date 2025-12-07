// Utility functions for serverless environment

/**
 * Parse request body
 * Handles both JSON and URL-encoded data
 */
async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                if (body) {
                    const contentType = req.headers['content-type'] || '';

                    if (contentType.includes('application/json')) {
                        resolve(JSON.parse(body));
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
                        const params = new URLSearchParams(body);
                        const data = {};
                        for (const [key, value] of params) {
                            data[key] = value;
                        }
                        resolve(data);
                    } else {
                        resolve(body);
                    }
                } else {
                    resolve({});
                }
            } catch (error) {
                reject(error);
            }
        });

        req.on('error', reject);
    });
}

/**
 * Send JSON response
 */
function sendJson(res, data, statusCode = 200) {
    res.status(statusCode).json(data);
}

/**
 * Send error response
 */
function sendError(res, message, statusCode = 500) {
    res.status(statusCode).json({
        error: message
    });
}

/**
 * Extract route parameters from URL
 * Example: /api/courses/123 with pattern /api/courses/:id
 */
function extractParams(url, pattern) {
    const urlParts = url.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            const paramName = patternParts[i].slice(1);
            params[paramName] = urlParts[i];
        }
    }

    return params;
}

/**
 * Get query parameters from URL
 */
function getQueryParams(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const params = {};

    url.searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return params;
}

module.exports = {
    parseBody,
    sendJson,
    sendError,
    extractParams,
    getQueryParams
};
