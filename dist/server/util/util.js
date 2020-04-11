"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateUUID() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
exports.generateUUID = generateUUID;
// export function debugMethod(target: any, name: any, desc: any) {
//     const method = desc.value;
//     desc.value = () => {
//         const prevMethod = this.currentMethod;
//         console.log(name);
//         method.apply(this, arguments);
//     }
// }
function debugMethod(target, propertyKey, descriptor) {
    console.log(propertyKey);
}
exports.debugMethod = debugMethod;
//# sourceMappingURL=util.js.map