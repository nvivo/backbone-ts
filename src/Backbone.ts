/// <reference path="_references.ts" />

module Backbone {

    var _window = <any> window;

    // Current version of the library. Keep in sync with `package.json`.
    export var VERSION = '1.0.0';

    // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
    // the `$` variable.
    export var $: JQueryStatic = _window.jQuery || _window.Zepto || _window.ender || _window.$;

    // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
    // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
    // set a `X-Http-Method-Override` header.
    export var emulateHTTP = false;

    // Turn on `emulateJSON` to support legacy servers that can't deal with direct
    // `application/json` requests ... will encode the body as
    // `application/x-www-form-urlencoded` instead and will send the model in a
    // form param named `model`.
    export var emulateJSON = false;

}
