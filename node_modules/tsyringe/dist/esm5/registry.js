var Registry = (function () {
    function Registry() {
        this._registryMap = new Map();
    }
    Registry.prototype.entries = function () {
        return this._registryMap.entries();
    };
    Registry.prototype.getAll = function (key) {
        this.ensure(key);
        return this._registryMap.get(key);
    };
    Registry.prototype.get = function (key) {
        this.ensure(key);
        var value = this._registryMap.get(key);
        return value[value.length - 1] || null;
    };
    Registry.prototype.set = function (key, value) {
        this.ensure(key);
        this._registryMap.get(key).push(value);
    };
    Registry.prototype.setAll = function (key, value) {
        this._registryMap.set(key, value);
    };
    Registry.prototype.has = function (key) {
        this.ensure(key);
        return this._registryMap.get(key).length > 0;
    };
    Registry.prototype.clear = function () {
        this._registryMap.clear();
    };
    Registry.prototype.ensure = function (key) {
        if (!this._registryMap.has(key)) {
            this._registryMap.set(key, []);
        }
    };
    return Registry;
}());
export default Registry;
