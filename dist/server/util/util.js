"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateUUID() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
exports.generateUUID = generateUUID;
//# sourceMappingURL=util.js.map