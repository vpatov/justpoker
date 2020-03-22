"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
function getParamInfo(target) {
    const params = Reflect.getMetadata("design:paramtypes", target) || [];
    const injectionTokens = Reflect.getOwnMetadata(exports.INJECTION_TOKEN_METADATA_KEY, target) || {};
    Object.keys(injectionTokens).forEach(key => {
        params[+key] = injectionTokens[key];
    });
    return params;
}
exports.getParamInfo = getParamInfo;
function defineInjectionTokenMetadata(data) {
    return function (target, _propertyKey, parameterIndex) {
        const injectionTokens = Reflect.getOwnMetadata(exports.INJECTION_TOKEN_METADATA_KEY, target) || {};
        injectionTokens[parameterIndex] = data;
        Reflect.defineMetadata(exports.INJECTION_TOKEN_METADATA_KEY, injectionTokens, target);
    };
}
exports.defineInjectionTokenMetadata = defineInjectionTokenMetadata;
