import constructor from "./types/constructor";
import { ParamInfo } from "./dependency-container";
export declare const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
export declare function getParamInfo(target: constructor<any>): ParamInfo[];
export declare function defineInjectionTokenMetadata(data: any): (target: any, propertyKey: string | symbol, parameterIndex: number) => any;
