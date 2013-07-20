/// <reference path="_references.ts" />

module Backbone {

    export interface CollectionOptions {
        comparator?;
        model?: Model;
    }

    export interface CollectionAddOptions extends SilentOptions {
        at?: number;
    }

    export interface CollectionRemoveOptions extends SilentOptions {
        index?: number;
    }

    export interface CollectionSetOptions extends ParseOptions, SilentOptions {
        add?;
        merge?;
        remove?;
        sort?;
        at?;
        _attrs?;
    }

    export interface CollectionResetOptions extends SilentOptions {
        previousModels?;
    }

    export interface CollectionFetchOptions extends PersistenceOptions, ParseOptions {
        reset?: boolean;
    }

    // Default options for `Collection#set`.
    var setOptions = { add: true, remove: true, merge: true };
    var addOptions = { add: true, remove: false };

    // Backbone.Collection
    // -------------------

    // If models tend to represent a single row of data, a Backbone Collection is
    // more analagous to a table full of data ... or a small slice or page of that
    // table, or a collection of rows that belong together for a particular reason
    // -- all of the messages in this particular folder, all of the documents
    // belonging to this particular author, and so on. Collections maintain
    // indexes of their models, both in order, and for lookup by `id`.

    // Create a new **Collection**, perhaps to contain a specific type of `model`.
    // If a `comparator` is specified, the Collection will maintain
    // its models in sort order, as they're added and removed.

    export class Collection extends EventBase {

        static extend;

        constructor(models?: Model[], options?: CollectionOptions) {
            super();

            if (!this.model) this.model = Model;
            options || (options = {});
            if (options.model) this.model = options.model;
            if (options.comparator !== void 0) this.comparator = options.comparator;
            this._reset();
            this.initialize.apply(this, arguments);
            if (models) this.reset(models, _.extend({ silent: true }, options));
        }

        comparator: any;
        length: number;
        models: Model[];

        _byId;

        // The default model for a collection is just a **Backbone.Model**.
        // This should be overridden in most cases.
        model;

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize() { }

        // The JSON representation of a Collection is an array of the
        // models' attributes.
        toJSON(options?: any) {
            return (<any> this).map(function (model) { return model.toJSON(options); });
        }

        // Proxy `Backbone.sync` by default.
        sync(...args) {
            return Backbone.sync.apply(this, arguments);
        }

        // Add a model, or list of models to the set.
        add(model: Model, options?: CollectionAddOptions): any
        add(models: Model[], options?: CollectionAddOptions): any
        add(models: any, options?: CollectionAddOptions): any {
            return this.set(models, _.extend({ merge: false }, options, addOptions));
        }

        // Remove a model, or a list of models from the set.
        remove(model: Model, options?: CollectionRemoveOptions): any
        remove(models: Model[], options?: CollectionRemoveOptions): any
        remove(models: any, options?: CollectionRemoveOptions): any {
            models = _.isArray(models) ? models.slice() : [models];
            options || (options = {});
            var i, l, index, model;
            for (i = 0, l = models.length; i < l; i++) {
                model = this.get(models[i]);
                if (!model) continue;
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
        }

        // Update a collection by `set`-ing a new list of models, adding new ones,
        // removing models that are no longer present, and merging models that
        // already exist in the collection, as necessary. Similar to **Model#set**,
        // the core operation for updating the data contained by the collection.
        set(models: Model[], options?: CollectionSetOptions): Collection {
            options = _.defaults({}, options, setOptions);
            if (options.parse) models = this.parse(models, options);
            if (!_.isArray(models)) models = models ? [models] : [];
            var i, l, model, attrs, existing, sort;
            var at = options.at;
            var sortable = this.comparator && (at == null) && options.sort !== false;
            var sortAttr = _.isString(this.comparator) ? this.comparator : null;
            var toAdd = [], toRemove = [], modelMap = {};
            var add = options.add, merge = options.merge, remove = options.remove;
            var order = !sortable && add && remove ? [] : null;

            // Turn bare objects into model references, and prevent invalid models
            // from being added.
            for (i = 0, l = models.length; i < l; i++) {
                if (!(model = this._prepareModel(attrs = models[i], options))) continue;

                // If a duplicate is found, prevent it from being added and
                // optionally merge it into the existing model.
                if (existing = this.get(model)) {
                    if (remove) modelMap[existing.cid] = true;
                    if (merge) {
                        attrs = attrs === model ? model.attributes : options._attrs;
                        existing.set(attrs, options);
                        if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
                    }

                    // This is a new model, push it to the `toAdd` list.
                } else if (add) {
                    toAdd.push(model);

                    // Listen to added models' events, and index models for lookup by
                    // `id` and by `cid`.
                    model.on('all', this._onModelEvent, this);
                    this._byId[model.cid] = model;
                    if (model.id != null) this._byId[model.id] = model;
                }
                if (order) order.push(existing || model);
                delete options._attrs;
            }

            // Remove nonexistent models if appropriate.
            if (remove) {
                for (i = 0, l = this.length; i < l; ++i) {
                    if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
                }
                if (toRemove.length) this.remove(toRemove, options);
            }

            // See if sorting is needed, update `length` and splice in new models.
            if (toAdd.length || (order && order.length)) {
                if (sortable) sort = true;
                this.length += toAdd.length;
                if (at != null) {
                    Array.prototype.splice.apply(this.models, [at, 0].concat(toAdd));
                } else {
                    if (order) this.models.length = 0;
                    Array.prototype.push.apply(this.models, order || toAdd);
                }
            }

            // Silently sort the collection if appropriate.
            if (sort) this.sort({ silent: true });

            if (options.silent) return this;

            // Trigger `add` events.
            for (i = 0, l = toAdd.length; i < l; i++) {
                (model = toAdd[i]).trigger('add', model, this, options);
            }

            // Trigger `sort` if the collection was sorted.
            if (sort || (order && order.length)) this.trigger('sort', this, options);
            return this;
        }

        // When you have more items than you want to add or remove individually,
        // you can reset the entire set with a new list of models, without firing
        // any granular `add` or `remove` events. Fires `reset` when finished.
        // Useful for bulk operations and optimizations.
        reset(models: Model[], options?: CollectionResetOptions): Collection {
            options || (options = {});
            for (var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            options.previousModels = this.models;
            this._reset();
            this.add(models, _.extend({ silent: true }, options));
            if (!options.silent) this.trigger('reset', this, options);
            return this;
        }

        // Add a model to the end of the collection.
        push(model: Model, options?: CollectionAddOptions): Model {
            model = this._prepareModel(model, options);
            this.add(model, _.extend({ at: this.length }, options));
            return model;
        }

        // Remove a model from the end of the collection.
        pop(options?: SilentOptions): Model {
            var model = this.at(this.length - 1);
            this.remove(model, options);
            return model;
        }

        // Add a model to the beginning of the collection.
        unshift(model: Model, options?: CollectionAddOptions): Model {
            model = this._prepareModel(model, options);
            this.add(model, _.extend({ at: 0 }, options));
            return model;
        }

        // Remove a model from the beginning of the collection.
        shift(options?: SilentOptions): Model {
            var model = this.at(0);
            this.remove(model, options);
            return model;
        }

        // Slice out a sub-array of models from the collection.
        slice(): any[] {
            return Array.prototype.slice.apply(this.models, arguments);
        }

        // Get a model from the set by id.
        get(obj: any): Model {
            if (obj == null) return <any> void 0;
            return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
        }

        // Get the model at the given index.
        at(index: number): Model {
            return this.models[index];
        }

        // Return models with matching attributes. Useful for simple cases of
        // `filter`.
        where(attrs: any, first: boolean): Model[] {
            if (_.isEmpty(attrs)) return first ? <any> void 0 : [];
            return this[first ? 'find' : 'filter'](function (model) {
                for (var key in attrs) {
                    if (attrs[key] !== model.get(key)) return false;
                }
                return true;
            });
        }

        // Return the first model with matching attributes. Useful for simple cases
        // of `find`.
        findWhere(attrs: any): Model {
            return <any> this.where(attrs, true);
        }

        // Force the collection to re-sort itself. You don't need to call this under
        // normal circumstances, as the set will maintain sort order as each item
        // is added.
        sort(options?: SilentOptions): Collection {
            if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
            options || (options = {});

            // Run sort based on type of `comparator`.
            if (_.isString(this.comparator) || this.comparator.length === 1) {
                this.models = this.sortBy(this.comparator, this);
            } else {
                this.models.sort(_.bind(this.comparator, this));
            }

            if (!options.silent) this.trigger('sort', this, options);
            return this;
        }

        // Figure out the smallest index at which a model should be inserted so as
        // to maintain order.
        sortedIndex(model: Model, value: (model: Model) => any, context): number {
            value || (value = this.comparator);
            var iterator = _.isFunction(value) ? value : function (model) {
                return model.get(value);
            };
            return _.sortedIndex(this.models, model, iterator, context);
        }

        // Pluck an attribute from each model in the collection.
        pluck(attr: any): any {
            return _.invoke(this.models, 'get', attr);
        }

        // Fetch the default set of models for this collection, resetting the
        // collection when they arrive. If `reset: true` is passed, the response
        // data will be passed through the `reset` method instead of `set`.
        fetch(options?: CollectionFetchOptions): JQueryXHR
        fetch(options?: any): JQueryXHR {
            options = options ? _.clone(options) : {};
            if (options.parse === void 0) options.parse = true;
            var success = options.success;
            var collection = this;
            options.success = function (resp) {
                var method = options.reset ? 'reset' : 'set';
                collection[method](resp, options);
                if (success) success(collection, resp, options);
                collection.trigger('sync', collection, resp, options);
            };
            Helpers.wrapError(this, options);
            return this.sync('read', this, options);
        }

        // Create a new instance of a model in this collection. Add the model to the
        // collection immediately, unless `wait: true` is passed, in which case we
        // wait for the server to agree.
        create(model: any, options?: ModelSaveOptions): Model
        create(model: any, options?: any): Model {
            options = options ? _.clone(options) : {};
            if (!(model = this._prepareModel(model, options))) return <any> false;
            if (!options.wait) this.add(model, options);
            var collection = this;
            var success = options.success;
            options.success = function (model, resp, options) {
                if (options.wait) collection.add(model, options);
                if (success) success(model, resp, options);
            };
            model.save(null, options);
            return model;
        }

        // **parse** converts a response into a list of models to be added to the
        // collection. The default implementation is just to pass it through.
        parse(resp: any, options: any): any {
            return resp;
        }

        // Create a new collection with an identical list of models as this one.
        clone(): Collection {
            return new (<any> this).constructor(this.models);
        }

        // Private method to reset all internal state. Called when the collection
        // is first initialized or reset.
        _reset() {
            this.length = 0;
            this.models = [];
            this._byId = {};
        }

        // Prepare a hash of attributes (or other model) to be added to this
        // collection.
        _prepareModel(attrs?: any, options?: ModelOptions): Model {
            if (attrs instanceof Model) {
                if (!attrs.collection) attrs.collection = this;
                return attrs;
            }
            options || (options = {});
            options.collection = this;
            var model = new this.model(attrs, options);
            if (!model.validationError) return model;
            this.trigger('invalid', this, attrs, options);
            return <any> false;
        }

        // Internal method to sever a model's ties to a collection.
        _removeReference(model: Model): void {
            if (this === model.collection) delete model.collection;
            model.off('all', this._onModelEvent, this);
        }

        // Internal method called every time a model in the set fires an event.
        // Sets need to update their indexes when models change ids. All other
        // events simply proxy through. "add" and "remove" events that originate
        // in other collections are ignored.
        _onModelEvent(event: string, model: Model, collection: Collection, options: any) {
            if ((event === 'add' || event === 'remove') && collection !== this) return;
            if (event === 'destroy') this.remove(model, options);
            if (model && event === 'change:' + model.idAttribute) {
                delete this._byId[model.previous(model.idAttribute)];
                if (model.id != null) this._byId[model.id] = model;
            }
            this.trigger.apply(this, arguments);
        }

        /* underscore mixins */

        all: (iterator: (element: Model, index: number) => boolean, context?: any) => boolean;
        any: (iterator: (element: Model, index: number) => boolean, context?: any) => boolean;
        collect: (iterator: (element: Model, index: number, context?: any) => any[], context?: any) => any[];
        chain: () => any;
        compact: () => Model[];
        contains: (value: any) => boolean;
        countBy: (iterator: (element: Model, index: number) => any) => any[];
        detect: (iterator: (item: any) => boolean, context?: any) => any; // ???
        difference: (...model: Model[]) => Model[];
        drop: (n?: number) => Model[];
        each: (iterator: (element: Model, index: number, list?: any) => void , context?: any) => void;
        every: (iterator: (element: Model, index: number) => boolean, context?: any) => boolean;
        filter: (iterator: (element: Model, index: number) => boolean, context?: any) => Model[];
        find: (iterator: (element: Model, index: number) => boolean, context?: any) => Model;
        first: (n?: number) => Model[];
        flatten: (shallow?: boolean) => Model[];
        foldl: (iterator: (memo: any, element: Model, index: number) => any, initialMemo: any, context?: any) => any;
        forEach: (iterator: (element: Model, index: number, list?: any) => void , context?: any) => void;
        include: (value: any) => boolean;
        indexOf: (element: Model, isSorted?: boolean) => number;
        initial: (n?: number) => Model[];
        inject: (iterator: (memo: any, element: Model, index: number) => any, initialMemo: any, context?: any) => any;
        intersection: (...model: Model[]) => Model[];
        isEmpty: (object: any) => boolean;
        invoke: (methodName: string, arguments?: any[]) => any;
        last: (n?: number) => Model[];
        lastIndexOf: (element: Model, fromIndex?: number) => number;
        map: (iterator: (element: Model, index: number, context?: any) => any[], context?: any) => any[];
        max: (iterator?: (element: Model, index: number) => any, context?: any) => Model;
        min: (iterator?: (element: Model, index: number) => any, context?: any) => Model;
        object: (...values: any[]) => any[];
        reduce: (iterator: (memo: any, element: Model, index: number) => any, initialMemo: any, context?: any) => any;
        select: (iterator: any, context?: any) => any[];
        size: () => number;
        shuffle: () => any[];
        some: (iterator: (element: Model, index: number) => boolean, context?: any) => boolean;
        sortBy: (iterator: (element: Model, index: number) => number, context?: any) => Model[];
        reduceRight: (iterator: (memo: any, element: Model, index: number) => any, initialMemo: any, context?: any) => any[];
        reject: (iterator: (element: Model, index: number) => boolean, context?: any) => Model[];
        rest: (n?: number) => Model[];
        tail: (n?: number) => Model[];
        toArray: () => any[];
        union: (...model: Model[]) => Model[];
        uniq: (isSorted?: boolean, iterator?: (element: Model, index: number) => boolean) => Model[];
        without: (...values: any[]) => Model[];
        zip: (...model: Model[]) => Model[];
    }

    // Underscore methods that we want to implement on the Collection.
    // 90% of the core usefulness of Backbone Collections is actually implemented
    // right here:
    var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
        'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
        'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
        'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
        'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
        'lastIndexOf', 'isEmpty', 'chain'];

    // Mix in each Underscore method as a proxy to `Collection#models`.
    _.each(methods, function (method) {
        Collection.prototype[method] = function (...args) {
            args.unshift(this.models);
            return _[method].apply(_, args);
        };
    });

    // Underscore methods that take a property name as an argument.
    var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

    // Use attributes instead of properties.
    _.each(attributeMethods, function (method) {
        Collection.prototype[method] = function (value, context) {
            var iterator = _.isFunction(value) ? value : function (model) {
                return model.get(value);
            };
            return _[method](this.models, iterator, context);
        };
    });
}
