import { getParamInfo } from "../reflection-helpers";
import { instance as globalContainer } from "../dependency-container";
import { isTokenDescriptor } from "../providers/injection-token";
import { formatErrorCtor } from "../error-helpers";
function autoInjectable() {
    return function (target) {
        const paramInfo = getParamInfo(target);
        return class extends target {
            constructor(...args) {
                super(...args.concat(paramInfo.slice(args.length).map((type, index) => {
                    try {
                        if (isTokenDescriptor(type)) {
                            return type.multiple
                                ? globalContainer.resolveAll(type.token)
                                : globalContainer.resolve(type.token);
                        }
                        return globalContainer.resolve(type);
                    }
                    catch (e) {
                        const argIndex = index + args.length;
                        throw new Error(formatErrorCtor(target, argIndex, e));
                    }
                })));
            }
        };
    };
}
export default autoInjectable;
