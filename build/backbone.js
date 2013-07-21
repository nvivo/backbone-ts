var Backbone;
(function (Backbone) {
    var EventBase = (function () {
        function EventBase() {
        }
        EventBase.prototype.on = function (name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback)
                return this;
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            events.push({ callback: callback, context: context, ctx: context || this });
            return this;
        };

        EventBase.prototype.once = function (name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback)
                return this;
            var self = this;
            var once = _.once(function () {
                self.off(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        };

        EventBase.prototype.off = function (name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context]))
                return this;
            if (!name && !callback && !context) {
                this._events = {};
                return this;
            }

            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                if (events = this._events[name]) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) || (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length)
                        delete this._events[name];
                }
            }

            return this;
        };

        EventBase.prototype.trigger = function (name) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (!this._events)
                return this;
            if (!eventsApi(this, 'trigger', name, args))
                return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events)
                triggerEvents(events, args);
            if (allEvents)
                triggerEvents(allEvents, arguments);
            return this;
        };

        EventBase.prototype.stopListening = function (obj, name, callback) {
            var listeners = this._listeners;
            if (!listeners)
                return this;
            var deleteListener = !name && !callback;
            if (typeof name === 'object')
                callback = this;
            if (obj)
                (listeners = {})[obj._listenerId] = obj;
            for (var id in listeners) {
                listeners[id].off(name, callback, this);
                if (deleteListener)
                    delete this._listeners[id];
            }
            return this;
        };

        EventBase.prototype.listenTo = function (name, callback, context) {
        };
        EventBase.prototype.listenToOnce = function (name, callback, context) {
        };
        return EventBase;
    })();
    Backbone.EventBase = EventBase;

    var eventSplitter = /\s+/;

    var eventsApi = function (obj, action, name, rest) {
        if (!name)
            return true;

        if (typeof name === 'object') {
            for (var key in name) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
            return false;
        }

        if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
            return false;
        }

        return true;
    };

    var triggerEvents = function (events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx);
                return;
            case 1:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1);
                return;
            case 2:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1, a2);
                return;
            case 3:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                return;
            default:
                while (++i < l)
                    (ev = events[i]).callback.apply(ev.ctx, args);
        }
    };

    var listenMethods = { listenTo: 'on', listenToOnce: 'once' };

    _.each(listenMethods, function (implementation, method) {
        EventBase.prototype[method] = function (obj, name, callback) {
            var listeners = this._listeners || (this._listeners = {});
            var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
            listeners[id] = obj;
            if (typeof name === 'object')
                callback = this;
            obj[implementation](name, callback, this);
            return this;
        };
    });

    Backbone.Events = {};

    var eventMethods = ['on', 'once', 'off', 'trigger', 'listenTo', 'listenToOnce', 'stopListening'];
    _.each(eventMethods, function (methodName) {
        return Backbone.Events[methodName] = EventBase.prototype[methodName];
    });

    _.extend(Backbone, Backbone.Events);
})(Backbone || (Backbone = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Backbone;
(function (Backbone) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(attributes, options) {
            _super.call(this);
            this.changed = null;
            this.validationError = null;

            if (!this.idAttribute)
                this.idAttribute = 'id';
            var defaults;
            var attrs = attributes || {};
            options || (options = {});
            this.cid = _.uniqueId('c');
            this.attributes = {};
            if (options.collection)
                this.collection = options.collection;
            if (options.parse)
                attrs = this.parse(attrs, options) || {};
            options._attrs || (options._attrs = attrs);
            if (defaults = _.result(this, 'defaults')) {
                attrs = _.defaults({}, attrs, defaults);
            }
            this.set(attrs, options);
            this.changed = {};
            this.initialize.apply(this, arguments);
        }
        Model.prototype.initialize = function (attributes, options) {
        };

        Model.prototype.toJSON = function (options) {
            return _.clone(this.attributes);
        };

        Model.prototype.sync = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Backbone.sync.apply(this, arguments);
        };

        Model.prototype.get = function (attr) {
            return this.attributes[attr];
        };

        Model.prototype.escape = function (attr) {
            return _.escape(this.get(attr));
        };

        Model.prototype.has = function (attr) {
            return this.get(attr) != null;
        };

        Model.prototype.set = function (key, val, options) {
            var attr, attrs, unset, changes, silent, changing, prev, current;
            if (key == null)
                return this;

            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options || (options = {});

            if (!this._validate(attrs, options))
                return false;

            unset = options.unset;
            silent = options.silent;
            changes = [];
            changing = this._changing;
            this._changing = true;

            if (!changing) {
                this._previousAttributes = _.clone(this.attributes);
                this.changed = {};
            }
            current = this.attributes, prev = this._previousAttributes;

            if (this.idAttribute in attrs)
                this.id = attrs[this.idAttribute];

            for (attr in attrs) {
                val = attrs[attr];
                if (!_.isEqual(current[attr], val))
                    changes.push(attr);
                if (!_.isEqual(prev[attr], val)) {
                    this.changed[attr] = val;
                } else {
                    delete this.changed[attr];
                }
                unset ? delete current[attr] : current[attr] = val;
            }

            if (!silent) {
                if (changes.length)
                    this._pending = true;
                for (var i = 0, l = changes.length; i < l; i++) {
                    this.trigger('change:' + changes[i], this, current[changes[i]], options);
                }
            }

            if (changing)
                return this;
            if (!silent) {
                while (this._pending) {
                    this._pending = false;
                    this.trigger('change', this, options);
                }
            }
            this._pending = false;
            this._changing = false;
            return this;
        };

        Model.prototype.unset = function (attr, options) {
            return this.set(attr, void 0, _.extend({}, options, { unset: true }));
        };

        Model.prototype.clear = function (options) {
            var attrs = {};
            for (var key in this.attributes)
                attrs[key] = void 0;
            return this.set(attrs, _.extend({}, options, { unset: true }));
        };

        Model.prototype.hasChanged = function (attr) {
            if (attr == null)
                return !_.isEmpty(this.changed);
            return _.has(this.changed, attr);
        };

        Model.prototype.changedAttributes = function (diff) {
            if (!diff)
                return this.hasChanged() ? _.clone(this.changed) : false;
            var val, changed = false;
            var old = this._changing ? this._previousAttributes : this.attributes;
            for (var attr in diff) {
                if (_.isEqual(old[attr], (val = diff[attr])))
                    continue;
                (changed || (changed = {}))[attr] = val;
            }
            return changed;
        };

        Model.prototype.previous = function (attr) {
            if (attr == null || !this._previousAttributes)
                return null;
            return this._previousAttributes[attr];
        };

        Model.prototype.previousAttributes = function () {
            return _.clone(this._previousAttributes);
        };

        Model.prototype.fetch = function (options) {
            options = options ? _.clone(options) : {};
            if (options.parse === void 0)
                options.parse = true;
            var model = this;
            var success = options.success;
            options.success = function (resp) {
                if (!model.set(model.parse(resp, options), options))
                    return false;
                if (success)
                    success(model, resp, options);
                model.trigger('sync', model, resp, options);
            };
            Backbone.Helpers.wrapError(this, options);
            return this.sync('read', this, options);
        };

        Model.prototype.save = function (key, val, options) {
            var attrs, method, xhr, attributes = this.attributes;

            if (key == null || typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options = _.extend({ validate: true }, options);

            if (attrs && !options.wait) {
                if (!this.set(attrs, options))
                    return false;
            } else {
                if (!this._validate(attrs, options))
                    return false;
            }

            if (attrs && options.wait) {
                this.attributes = _.extend({}, attributes, attrs);
            }

            if (options.parse === void 0)
                options.parse = true;
            var model = this;
            var success = options.success;
            options.success = function (resp) {
                model.attributes = attributes;
                var serverAttrs = model.parse(resp, options);
                if (options.wait)
                    serverAttrs = _.extend(attrs || {}, serverAttrs);
                if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
                    return false;
                }
                if (success)
                    success(model, resp, options);
                model.trigger('sync', model, resp, options);
            };
            Backbone.Helpers.wrapError(this, options);

            method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
            if (method === 'patch')
                options.attrs = attrs;
            xhr = this.sync(method, this, options);

            if (attrs && options.wait)
                this.attributes = attributes;

            return xhr;
        };

        Model.prototype.destroy = function (options) {
            options = options ? _.clone(options) : {};
            var model = this;
            var success = options.success;

            var destroy = function () {
                model.trigger('destroy', model, model.collection, options);
            };

            (options).success = function (resp) {
                if (options.wait || model.isNew())
                    destroy();
                if (success)
                    success(model, resp, options);
                if (!model.isNew())
                    model.trigger('sync', model, resp, options);
            };

            if (this.isNew()) {
                options.success();
                return false;
            }
            Backbone.Helpers.wrapError(this, options);

            var xhr = this.sync('delete', this, options);
            if (!options.wait)
                destroy();
            return xhr;
        };

        Model.prototype.url = function () {
            var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || Backbone.Helpers.urlError();
            if (this.isNew())
                return base;
            return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
        };

        Model.prototype.parse = function (resp, options) {
            return resp;
        };

        Model.prototype.clone = function () {
            return new (this).constructor(this.attributes);
        };

        Model.prototype.isNew = function () {
            return this.id == null;
        };

        Model.prototype.isValid = function (options) {
            return this._validate({}, _.extend(options || {}, { validate: true }));
        };

        Model.prototype._validate = function (attrs, options) {
            if (!options.validate || !this.validate)
                return true;
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validationError = this.validate(attrs, options) || null;
            if (!error)
                return true;
            this.trigger('invalid', this, error, _.extend(options || {}, { validationError: error }));
            return false;
        };
        return Model;
    })(Backbone.EventBase);
    Backbone.Model = Model;

    var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

    _.each(modelMethods, function (method) {
        Model.prototype[method] = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            args.unshift(this.attributes);
            return _[method].apply(_, args);
        };
    });
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    var setOptions = { add: true, remove: true, merge: true };
    var addOptions = { add: true, remove: false };

    var Collection = (function (_super) {
        __extends(Collection, _super);
        function Collection(models, options) {
            _super.call(this);

            if (!this.model)
                this.model = Backbone.Model;
            options || (options = {});
            if (options.model)
                this.model = options.model;
            if (options.comparator !== void 0)
                this.comparator = options.comparator;
            this._reset();
            this.initialize.apply(this, arguments);
            if (models)
                this.reset(models, _.extend({ silent: true }, options));
        }
        Collection.prototype.initialize = function () {
        };

        Collection.prototype.toJSON = function (options) {
            return (this).map(function (model) {
                return model.toJSON(options);
            });
        };

        Collection.prototype.sync = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            return Backbone.sync.apply(this, arguments);
        };

        Collection.prototype.add = function (models, options) {
            return this.set(models, _.extend({ merge: false }, options, addOptions));
        };

        Collection.prototype.remove = function (models, options) {
            models = _.isArray(models) ? models.slice() : [models];
            options || (options = {});
            var i, l, index, model;
            for (i = 0, l = models.length; i < l; i++) {
                model = this.get(models[i]);
                if (!model)
                    continue;
                delete this._byId[model.id];
                delete this._byId[model.cid];
                index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if (!options.silent) {
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                this._removeReference(model);
            }
            return this;
        };

        Collection.prototype.set = function (models, options) {
            options = _.defaults({}, options, setOptions);
            if (options.parse)
                models = this.parse(models, options);
            if (!_.isArray(models))
                models = models ? [models] : [];
            var i, l, model, attrs, existing, sort;
            var at = options.at;
            var sortable = this.comparator && (at == null) && options.sort !== false;
            var sortAttr = _.isString(this.comparator) ? this.comparator : null;
            var toAdd = [], toRemove = [], modelMap = {};
            var add = options.add, merge = options.merge, remove = options.remove;
            var order = !sortable && add && remove ? [] : null;

            for (i = 0, l = models.length; i < l; i++) {
                if (!(model = this._prepareModel(attrs = models[i], options)))
                    continue;

                if (existing = this.get(model)) {
                    if (remove)
                        modelMap[existing.cid] = true;
                    if (merge) {
                        attrs = attrs === model ? model.attributes : options._attrs;
                        existing.set(attrs, options);
                        if (sortable && !sort && existing.hasChanged(sortAttr))
                            sort = true;
                    }
                } else if (add) {
                    toAdd.push(model);

                    model.on('all', this._onModelEvent, this);
                    this._byId[model.cid] = model;
                    if (model.id != null)
                        this._byId[model.id] = model;
                }
                if (order)
                    order.push(existing || model);
                delete options._attrs;
            }

            if (remove) {
                for (i = 0, l = this.length; i < l; ++i) {
                    if (!modelMap[(model = this.models[i]).cid])
                        toRemove.push(model);
                }
                if (toRemove.length)
                    this.remove(toRemove, options);
            }

            if (toAdd.length || (order && order.length)) {
                if (sortable)
                    sort = true;
                this.length += toAdd.length;
                if (at != null) {
                    Array.prototype.splice.apply(this.models, [at, 0].concat(toAdd));
                } else {
                    if (order)
                        this.models.length = 0;
                    Array.prototype.push.apply(this.models, order || toAdd);
                }
            }

            if (sort)
                this.sort({ silent: true });

            if (options.silent)
                return this;

            for (i = 0, l = toAdd.length; i < l; i++) {
                (model = toAdd[i]).trigger('add', model, this, options);
            }

            if (sort || (order && order.length))
                this.trigger('sort', this, options);
            return this;
        };

        Collection.prototype.reset = function (models, options) {
            options || (options = {});
            for (var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            options.previousModels = this.models;
            this._reset();
            this.add(models, _.extend({ silent: true }, options));
            if (!options.silent)
                this.trigger('reset', this, options);
            return this;
        };

        Collection.prototype.push = function (model, options) {
            model = this._prepareModel(model, options);
            this.add(model, _.extend({ at: this.length }, options));
            return model;
        };

        Collection.prototype.pop = function (options) {
            var model = this.at(this.length - 1);
            this.remove(model, options);
            return model;
        };

        Collection.prototype.unshift = function (model, options) {
            model = this._prepareModel(model, options);
            this.add(model, _.extend({ at: 0 }, options));
            return model;
        };

        Collection.prototype.shift = function (options) {
            var model = this.at(0);
            this.remove(model, options);
            return model;
        };

        Collection.prototype.slice = function () {
            return Array.prototype.slice.apply(this.models, arguments);
        };

        Collection.prototype.get = function (obj) {
            if (obj == null)
                return void 0;
            return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
        };

        Collection.prototype.at = function (index) {
            return this.models[index];
        };

        Collection.prototype.where = function (attrs, first) {
            if (_.isEmpty(attrs))
                return first ? void 0 : [];
            return this[first ? 'find' : 'filter'](function (model) {
                for (var key in attrs) {
                    if (attrs[key] !== model.get(key))
                        return false;
                }
                return true;
            });
        };

        Collection.prototype.findWhere = function (attrs) {
            return this.where(attrs, true);
        };

        Collection.prototype.sort = function (options) {
            if (!this.comparator)
                throw new Error('Cannot sort a set without a comparator');
            options || (options = {});

            if (_.isString(this.comparator) || this.comparator.length === 1) {
                this.models = this.sortBy(this.comparator, this);
            } else {
                this.models.sort(_.bind(this.comparator, this));
            }

            if (!options.silent)
                this.trigger('sort', this, options);
            return this;
        };

        Collection.prototype.sortedIndex = function (model, value, context) {
            value || (value = this.comparator);
            var iterator = _.isFunction(value) ? value : function (model) {
                return model.get(value);
            };
            return _.sortedIndex(this.models, model, iterator, context);
        };

        Collection.prototype.pluck = function (attr) {
            return _.invoke(this.models, 'get', attr);
        };

        Collection.prototype.fetch = function (options) {
            options = options ? _.clone(options) : {};
            if (options.parse === void 0)
                options.parse = true;
            var success = options.success;
            var collection = this;
            options.success = function (resp) {
                var method = options.reset ? 'reset' : 'set';
                collection[method](resp, options);
                if (success)
                    success(collection, resp, options);
                collection.trigger('sync', collection, resp, options);
            };
            Backbone.Helpers.wrapError(this, options);
            return this.sync('read', this, options);
        };

        Collection.prototype.create = function (model, options) {
            options = options ? _.clone(options) : {};
            if (!(model = this._prepareModel(model, options)))
                return false;
            if (!options.wait)
                this.add(model, options);
            var collection = this;
            var success = options.success;
            options.success = function (model, resp, options) {
                if (options.wait)
                    collection.add(model, options);
                if (success)
                    success(model, resp, options);
            };
            model.save(null, options);
            return model;
        };

        Collection.prototype.parse = function (resp, options) {
            return resp;
        };

        Collection.prototype.clone = function () {
            return new (this).constructor(this.models);
        };

        Collection.prototype._reset = function () {
            this.length = 0;
            this.models = [];
            this._byId = {};
        };

        Collection.prototype._prepareModel = function (attrs, options) {
            if (attrs instanceof Backbone.Model) {
                if (!attrs.collection)
                    attrs.collection = this;
                return attrs;
            }
            options || (options = {});
            options.collection = this;
            var model = new this.model(attrs, options);
            if (!model.validationError)
                return model;
            this.trigger('invalid', this, attrs, options);
            return false;
        };

        Collection.prototype._removeReference = function (model) {
            if (this === model.collection)
                delete model.collection;
            model.off('all', this._onModelEvent, this);
        };

        Collection.prototype._onModelEvent = function (event, model, collection, options) {
            if ((event === 'add' || event === 'remove') && collection !== this)
                return;
            if (event === 'destroy')
                this.remove(model, options);
            if (model && event === 'change:' + model.idAttribute) {
                delete this._byId[model.previous(model.idAttribute)];
                if (model.id != null)
                    this._byId[model.id] = model;
            }
            this.trigger.apply(this, arguments);
        };
        return Collection;
    })(Backbone.EventBase);
    Backbone.Collection = Collection;

    var methods = [
        'forEach',
        'each',
        'map',
        'collect',
        'reduce',
        'foldl',
        'inject',
        'reduceRight',
        'foldr',
        'find',
        'detect',
        'filter',
        'select',
        'reject',
        'every',
        'all',
        'some',
        'any',
        'include',
        'contains',
        'invoke',
        'max',
        'min',
        'toArray',
        'size',
        'first',
        'head',
        'take',
        'initial',
        'rest',
        'tail',
        'drop',
        'last',
        'without',
        'difference',
        'indexOf',
        'shuffle',
        'lastIndexOf',
        'isEmpty',
        'chain'
    ];

    _.each(methods, function (method) {
        Collection.prototype[method] = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            args.unshift(this.models);
            return _[method].apply(_, args);
        };
    });

    var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

    _.each(attributeMethods, function (method) {
        Collection.prototype[method] = function (value, context) {
            var iterator = _.isFunction(value) ? value : function (model) {
                return model.get(value);
            };
            return _[method](this.models, iterator, context);
        };
    });
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

    var View = (function (_super) {
        __extends(View, _super);
        function View(options) {
            _super.call(this);

            if (!this.tagName)
                this.tagName = 'div';

            this.cid = _.uniqueId('view');
            options || (options = {});
            _.extend(this, _.pick(options, viewOptions));
            this._ensureElement();
            this.initialize.apply(this, arguments);
            this.delegateEvents();
        }
        View.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };

        View.prototype.initialize = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
        };

        View.prototype.render = function () {
            return this;
        };

        View.prototype.remove = function () {
            this.$el.remove();
            this.stopListening();
            return this;
        };

        View.prototype.setElement = function (element, delegate) {
            if (this.$el)
                this.undelegateEvents();
            this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
            this.el = this.$el[0];
            if (delegate !== false)
                this.delegateEvents();
            return this;
        };

        View.prototype.delegateEvents = function (events) {
            if (!(events || (events = _.result(this, 'events'))))
                return this;
            this.undelegateEvents();
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method))
                    method = this[events[key]];
                if (!method)
                    continue;

                var match = key.match(delegateEventSplitter);
                var eventName = match[1], selector = match[2];
                method = _.bind(method, this);
                eventName += '.delegateEvents' + this.cid;
                if (selector === '') {
                    this.$el.on(eventName, method);
                } else {
                    this.$el.on(eventName, selector, method);
                }
            }
            return this;
        };

        View.prototype.undelegateEvents = function () {
            this.$el.off('.delegateEvents' + this.cid);
            return this;
        };

        View.prototype._ensureElement = function () {
            if (!this.el) {
                var attrs = _.extend({}, _.result(this, 'attributes'));
                if (this.id)
                    attrs.id = _.result(this, 'id');
                if (this.className)
                    attrs['class'] = _.result(this, 'className');
                var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
                this.setElement($el, false);
            } else {
                this.setElement(_.result(this, 'el'), false);
            }
        };
        return View;
    })(Backbone.EventBase);
    Backbone.View = View;
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    var _window = window;

    function sync(method, model, options) {
        var type = methodMap[method];

        _.defaults(options || (options = {}), {
            emulateHTTP: Backbone.emulateHTTP,
            emulateJSON: Backbone.emulateJSON
        });

        var params = { type: type, dataType: 'json' };

        if (!options.url) {
            params.url = _.result(model, 'url') || Backbone.Helpers.urlError();
        }

        if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }

        if (options.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? { model: params.data } : {};
        }

        if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
            params.type = 'POST';
            if (options.emulateJSON)
                params.data._method = type;
            var beforeSend = options.beforeSend;
            options.beforeSend = function (xhr) {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
                if (beforeSend)
                    return beforeSend.apply(this, arguments);
            };
        }

        if (params.type !== 'GET' && !options.emulateJSON) {
            params.processData = false;
        }

        if (params.type === 'PATCH' && noXhrPatch) {
            params.xhr = function () {
                return new ActiveXObject("Microsoft.XMLHTTP");
            };
        }

        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        model.trigger('request', model, xhr, options);
        return xhr;
    }
    Backbone.sync = sync;
    ;

    var noXhrPatch = typeof window !== 'undefined' && !!_window.ActiveXObject && !(_window.XMLHttpRequest && (new XMLHttpRequest()).dispatchEvent);

    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'patch': 'PATCH',
        'delete': 'DELETE',
        'read': 'GET'
    };

    function ajax() {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        return Backbone.$.ajax.apply(Backbone.$, arguments);
    }
    Backbone.ajax = ajax;
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    var Router = (function (_super) {
        __extends(Router, _super);
        function Router(options) {
            _super.call(this);
            options || (options = {});
            if (options.routes)
                this.routes = options.routes;
            this._bindRoutes();
            this.initialize.apply(this, arguments);
        }
        Router.prototype.initialize = function () {
        };

        Router.prototype.route = function (route, name, callback) {
            if (!_.isRegExp(route))
                route = this._routeToRegExp(route);
            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }
            if (!callback)
                callback = this[name];
            var router = this;
            Backbone.history.route(route, function (fragment) {
                var args = router._extractParameters(route, fragment);
                callback && callback.apply(router, args);
                router.trigger.apply(router, ['route:' + name].concat(args));
                router.trigger('route', name, args);
                Backbone.history.trigger('route', router, name, args);
            });
            return this;
        };

        Router.prototype.navigate = function (fragment, options) {
            Backbone.history.navigate(fragment, options);
            return this;
        };

        Router.prototype._bindRoutes = function () {
            if (!this.routes)
                return;
            this.routes = _.result(this, 'routes');
            var route, routes = _.keys(this.routes);
            while ((route = routes.pop()) != null) {
                this.route(route, this.routes[route]);
            }
        };

        Router.prototype._routeToRegExp = function (route) {
            route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
                return optional ? match : '([^\/]+)';
            }).replace(splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        };

        Router.prototype._extractParameters = function (route, fragment) {
            var params = route.exec(fragment).slice(1);
            return _.map(params, function (param) {
                return param ? decodeURIComponent(param) : null;
            });
        };
        return Router;
    })(Backbone.EventBase);
    Backbone.Router = Router;
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    var routeStripper = /^[#\/]|\s+$/g;

    var rootStripper = /^\/+|\/+$/g;

    var isExplorer = /msie [\w.]+/;

    var trailingSlash = /\/$/;

    var History = (function (_super) {
        __extends(History, _super);
        function History() {
            _super.call(this);
            this.interval = 50;
            this.handlers = [];
            _.bindAll(this, 'checkUrl');

            if (typeof window !== 'undefined') {
                this.location = window.location;
                this.history = window.history;
            }
        }
        History.prototype.getHash = function (window) {
            var match = (window || this).location.href.match(/#(.*)$/);
            return match ? match[1] : '';
        };

        History.prototype.getFragment = function (fragment, forcePushState) {
            if (fragment == null) {
                if (this._hasPushState || !this._wantsHashChange || forcePushState) {
                    fragment = this.location.pathname;
                    var root = this.root.replace(trailingSlash, '');
                    if (!fragment.indexOf(root))
                        fragment = fragment.slice(root.length);
                } else {
                    fragment = this.getHash();
                }
            }
            return fragment.replace(routeStripper, '');
        };

        History.prototype.start = function (options) {
            if (History.started)
                throw new Error("Backbone.history has already been started");
            History.started = true;

            this.options = _.extend({}, { root: '/' }, this.options, options);
            this.root = this.options.root;
            this._wantsHashChange = this.options.hashChange !== false;
            this._wantsPushState = !!this.options.pushState;
            this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
            var fragment = this.getFragment();
            var docMode = document.documentMode;
            var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

            this.root = ('/' + this.root + '/').replace(rootStripper, '/');

            if (oldIE && this._wantsHashChange) {
                this.iframe = (Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0]).contentWindow;
                this.navigate(fragment);
            }

            if (this._hasPushState) {
                Backbone.$(window).on('popstate', this.checkUrl);
            } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
                Backbone.$(window).on('hashchange', this.checkUrl);
            } else if (this._wantsHashChange) {
                this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
            }

            this.fragment = fragment;
            var loc = this.location;
            var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

            if (this._wantsHashChange && this._wantsPushState) {
                if (!this._hasPushState && !atRoot) {
                    this.fragment = this.getFragment(null, true);
                    this.location.replace(this.root + this.location.search + '#' + this.fragment);

                    return true;
                } else if (this._hasPushState && atRoot && loc.hash) {
                    this.fragment = this.getHash().replace(routeStripper, '');
                    this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
                }
            }

            if (!this.options.silent)
                return this.loadUrl();
        };

        History.prototype.stop = function () {
            Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
            clearInterval(this._checkUrlInterval);
            History.started = false;
        };

        History.prototype.route = function (route, callback) {
            this.handlers.unshift({ route: route, callback: callback });
        };

        History.prototype.checkUrl = function (e) {
            var current = this.getFragment();
            if (current === this.fragment && this.iframe) {
                current = this.getFragment(this.getHash(this.iframe));
            }
            if (current === this.fragment)
                return false;
            if (this.iframe)
                this.navigate(current);
            this.loadUrl();
        };

        History.prototype.loadUrl = function (fragmentOverride) {
            var fragment = this.fragment = this.getFragment(fragmentOverride);
            return _.any(this.handlers, function (handler) {
                if (handler.route.test(fragment)) {
                    handler.callback(fragment);
                    return true;
                }
            });
        };

        History.prototype.navigate = function (fragment, options) {
            if (!History.started)
                return false;
            if (!options || options === true)
                options = { trigger: !!options };

            fragment = this.getFragment(fragment || '');
            if (this.fragment === fragment)
                return;
            this.fragment = fragment;

            var url = this.root + fragment;

            if (fragment === '' && url !== '/')
                url = url.slice(0, -1);

            if (this._hasPushState) {
                this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
            } else if (this._wantsHashChange) {
                this._updateHash(this.location, fragment, options.replace);
                if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
                    if (!options.replace)
                        this.iframe.document.open().close();
                    this._updateHash(this.iframe.location, fragment, options.replace);
                }
            } else {
                return this.location.assign(url);
            }
            if (options.trigger)
                return this.loadUrl(fragment);
        };

        History.prototype._updateHash = function (location, fragment, replace) {
            if (replace) {
                var href = location.href.replace(/(javascript:|#).*$/, '');
                location.replace(href + '#' + fragment);
            } else {
                location.hash = '#' + fragment;
            }
        };
        History.started = false;
        return History;
    })(Backbone.EventBase);
    Backbone.History = History;

    Backbone.history = new History();
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    (function (Helpers) {
        Helpers.extend = function (protoProps, staticProps) {
            var parent = this;
            var child;

            if (protoProps && _.has(protoProps, 'constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            _.extend(child, parent, staticProps);

            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();

            if (protoProps)
                _.extend(child.prototype, protoProps);

            child.__super__ = parent.prototype;

            return child;
        };

        Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = Backbone.History.extend = Helpers.extend;

        Helpers.urlError = function () {
            throw new Error('A "url" property or function must be specified');
        };

        Helpers.wrapError = function (model, options) {
            var error = options.error;
            options.error = function (resp) {
                if (error)
                    error(model, resp, options);
                model.trigger('error', model, resp, options);
            };
        };
    })(Backbone.Helpers || (Backbone.Helpers = {}));
    var Helpers = Backbone.Helpers;
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    Backbone.VERSION = '1.0.0';

    var _window = window;
    Backbone.$ = _window.jQuery || _window.Zepto || _window.ender || _window.$;

    Backbone.emulateHTTP = false;

    Backbone.emulateJSON = false;
})(Backbone || (Backbone = {}));
