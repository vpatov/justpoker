import constructor from "../types/constructor";
declare type InjectionToken<T = any> = constructor<T> | string | symbol;
export declare function isNormalToken(token?: InjectionToken<any>): token is string | symbol;
export declare function isTokenDescriptor(descriptor: any): descriptor is TokenDescriptor;
export interface TokenDescriptor {
    token: InjectionToken<any>;
    multiple: boolean;
}
export default InjectionToken;
