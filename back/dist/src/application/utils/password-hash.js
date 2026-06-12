"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const node_crypto_1 = require("node:crypto");
const CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };
function generateKey(password, salt) {
    return new Promise((resolve, reject) => {
        (0, node_crypto_1.scrypt)(password.normalize('NFKC'), salt, CONFIG.dkLen, { N: CONFIG.N, r: CONFIG.r, p: CONFIG.p, maxmem: 128 * CONFIG.N * CONFIG.r * 2 }, (err, key) => (err ? reject(err) : resolve(key)));
    });
}
async function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(16).toString('hex');
    const key = await generateKey(password, salt);
    return `${salt}:${key.toString('hex')}`;
}
async function verifyPassword(hash, password) {
    const [salt, key] = hash.split(':');
    if (!salt || !key) {
        throw new Error('Invalid password hash');
    }
    const targetKey = await generateKey(password, salt);
    return targetKey.toString('hex') === key;
}
