import jwt from 'jsonwebtoken';

/**
 * Generate access token
 * @param {string} id - User ID
 * @returns {string} JWT access token
 */
export const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Generate refresh token
 * @param {string} id - User ID
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    });
};

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Generate both access and refresh tokens
 * @param {string} id - User ID
 * @returns {object} Object containing both tokens
 */
export const generateTokens = (id) => {
    return {
        accessToken: generateAccessToken(id),
        refreshToken: generateRefreshToken(id)
    };
};
