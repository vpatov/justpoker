export function isNormalToken(token) {
    return typeof token === "string" || typeof token === "symbol";
}
export function isTokenDescriptor(descriptor) {
    return (typeof descriptor === "object" &&
        "token" in descriptor &&
        "multiple" in descriptor);
}
