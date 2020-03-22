"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isNormalToken(token) {
    return typeof token === "string" || typeof token === "symbol";
}
exports.isNormalToken = isNormalToken;
function isTokenDescriptor(descriptor) {
    return (typeof descriptor === "object" &&
        "token" in descriptor &&
        "multiple" in descriptor);
}
exports.isTokenDescriptor = isTokenDescriptor;
