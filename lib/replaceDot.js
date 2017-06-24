module.exports = {

substituteKeyDeep:function(obj, target, replacement) {
    // Get the type of the object. Array for arrays, Object for objects, null for anything else.
    try {
        var type = obj.constructor === Array ? Array
          : (obj.constructor === Object ? Object : null);
    } catch (err) {
        // A try/catch is actually necessary here. This is because trying to access the `constructor` property
        // of some values throws an error. For example `null.constructor` throws a TypeError.
        var type = null;
    }
    
    if (type === Array) {
        // Simply do a recursive call on all values in array
        var ret = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            ret[i] = module.exports.substituteKeyDeep(obj[i], target, replacement);
        }
    } else if (type === Object) {
        // Do a recursive call on all values in object, AND substitute key values using `String.prototype.replace`
        var ret = {};
        for (var k in obj) {
            ret[k.replace(target, replacement)] = module.exports.substituteKeyDeep(obj[k], target, replacement);
        }
    } else {
        // For values that aren't objects or arrays, simply return the value
        var ret = obj;
    }
    
    return ret;
}


}
