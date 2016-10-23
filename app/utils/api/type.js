function Category(_) {
    this.name = _.name;
    this.description = _.description;
}

function Type(_) {
    Category.call(this, _);
    this.category = _.category;
    this.service = _.service;
    this.version = _.version;
}
function Field(_) {
    Type.call(this, _);
    this.type = _.type;
    this.system = _.system;
    this.required = _.required;
}
function Service(_) {
    Category.call(this, _);
    this.version = _.version;
    this.category = _.category;
    this.executor = _.executor;
    this.outputExample = _.outputExample;
    this.checkSign = _.checkSign;
    this.inputs = _.inputs;
    this.outputs = _.outputs;
}

Field.prototype.key = Type.prototype.key = function () {
    if (!this.category) this.category = '';
    if (!this.service) this.service = '';
    if (!this.version) this.version = '';
    return '/' + this.category + '/' + this.service + '/' + this.version + '/' + this.name;
    // return '/' + this.category + '/' + this.service + '/' + this.name;
}

Service.prototype.key = function () {
    if (!this.category) this.category = '';
    return '/' + this.category + '/' + this.name + '/' + this.version;
    // return '/' + this.category + '/' + this.name;
}

Category.prototype.key = function () {
    return '/' + this.name;
}

Type.parseKey = function (key) {
    console.log('parseKey:' + key);
    var result = {};
    if (key && typeof (key) == 'string') {
        var s = key.split('/');
        var l = s.length;
        var k = ['category', 'service', 'version', 'name'];
        // var k = ['category', 'service', 'name'];
        if (l == 4) {
            k = ['category', 'name', 'version'];
            // k = ['category', 'name'];
        }
        else if (l == 2) {
            k = ['name'];
        }
        for (var i = 1; i < l; i++) {
            result[k[i - 1]] = s[i];
        }
    }
    return result;
}

module.exports = function (api) {
    api.constructor.prototype.Category = Category;
    api.constructor.prototype.Type = Type;
    api.constructor.prototype.Field = Field;
    api.constructor.prototype.Service = Service;
}