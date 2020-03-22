import { InjectionToken } from ".";
import { Registration } from "./dependency-container";
export default class Registry {
    protected _registryMap: Map<InjectionToken<any>, Registration<any>[]>;
    entries(): IterableIterator<[InjectionToken<any>, Registration[]]>;
    getAll(key: InjectionToken<any>): Registration[];
    get(key: InjectionToken<any>): Registration | null;
    set(key: InjectionToken<any>, value: Registration): void;
    setAll(key: InjectionToken<any>, value: Registration[]): void;
    has(key: InjectionToken<any>): boolean;
    clear(): void;
    private ensure;
}
