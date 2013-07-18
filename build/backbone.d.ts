declare module Backbone {
    class EventBase {
        public _events;
        public _listeners;
        public on(name, callback, context): EventBase;
        public once(name, callback, context): EventBase;
        public off(name, callback, context?): EventBase;
        public trigger(name, ...args): EventBase;
        public stopListening(obj?, name?, callback?): EventBase;
        public listenTo: (name: any, callback: any, context: any) => EventBase;
        public listenToOnce: (name: any, callback: any, context: any) => EventBase;
    }
    var Events: {};
}
declare module Backbone {
    class Model extends Backbone.EventBase {
        static extend;
        constructor(attributes, options);
        public attributes;
        public cid;
        public collection;
        public id;
        public validate;
        public _changing;
        public _pending;
        public _previousAttributes;
        public changed;
        public validationError;
        public idAttribute;
        public initialize(): void;
        public toJSON(options);
        public sync(...args);
        public get(attr);
        public escape(attr): string;
        public has(attr): boolean;
        public set(key, val, options?): {};
        public unset(attr, options): {};
        public clear(options): {};
        public hasChanged(attr?): boolean;
        public changedAttributes(diff);
        public previous(attr);
        public previousAttributes();
        public fetch(options);
        public save(key, val, options);
        public destroy(options);
        public url();
        public parse(resp, options);
        public clone();
        public isNew(): boolean;
        public isValid(options): boolean;
        public _validate(attrs, options): boolean;
        public keys;
        public values;
        public pairs;
        public invert;
        public pick;
        public omit;
    }
}
declare module Backbone {
    class Collection extends Backbone.EventBase {
        static extend;
        constructor(models, options);
        public comparator;
        public length;
        public models;
        public _byId;
        public model;
        public initialize(): void;
        public toJSON(options);
        public sync(...args);
        public add(models, options): Collection;
        public remove(models, options): Collection;
        public set(models, options): Collection;
        public reset(models, options): Collection;
        public push(model, options);
        public pop(options);
        public unshift(model, options);
        public shift(options);
        public slice();
        public get(obj);
        public at(index);
        public where(attrs, first);
        public findWhere(attrs);
        public sort(options): Collection;
        public sortedIndex(model, value, context): number;
        public pluck(attr);
        public fetch(options);
        public create(model, options);
        public parse(resp, options);
        public clone();
        public _reset(): void;
        public _prepareModel(attrs, options);
        public _removeReference(model): void;
        public _onModelEvent(event, model, collection, options): void;
        public forEach;
        public each;
        public map;
        public collect;
        public reduce;
        public foldl;
        public inject;
        public reduceRight;
        public foldr;
        public find;
        public detect;
        public filter;
        public select;
        public reject;
        public every;
        public all;
        public some;
        public any;
        public include;
        public contains;
        public invoke;
        public max;
        public min;
        public toArray;
        public size;
        public first;
        public head;
        public take;
        public initial;
        public rest;
        public tail;
        public drop;
        public last;
        public without;
        public difference;
        public indexOf;
        public shuffle;
        public lastIndexOf;
        public isEmpty;
        public chain;
        public groupBy;
        public countBy;
        public sortBy;
    }
}
declare module Backbone {
    class View extends Backbone.EventBase {
        static extend;
        constructor(options);
        public className;
        public cid;
        public id;
        public $el;
        public el;
        public tagName;
        public $(selector);
        public initialize(): void;
        public render(): View;
        public remove(): View;
        public setElement(element, delegate): View;
        public delegateEvents(events?): View;
        public undelegateEvents(): View;
        public _ensureElement(): void;
    }
}
declare module Backbone {
    function sync(method, model, options);
    function ajax(...args);
}
declare module Backbone {
    class Router extends Backbone.EventBase {
        static extend;
        constructor(options);
        public routes;
        public initialize(): void;
        public route(route, name, callback?): Router;
        public navigate(fragment, options): Router;
        public _bindRoutes(): void;
        public _routeToRegExp(route): RegExp;
        public _extractParameters(route, fragment): any[];
    }
}
declare module Backbone {
    class History extends Backbone.EventBase {
        static extend;
        constructor();
        public fragment;
        public handlers;
        public history;
        public iframe;
        public location;
        public options;
        public root;
        public _checkUrlInterval;
        public _hasPushState;
        public _wantsHashChange;
        public _wantsPushState;
        static started: boolean;
        public interval: number;
        public getHash(window?);
        public getFragment(fragment?, forcePushState?);
        public start(options): boolean;
        public stop(): void;
        public route(route, callback): void;
        public checkUrl(e): boolean;
        public loadUrl(fragmentOverride?): boolean;
        public navigate(fragment, options?);
        public _updateHash(location, fragment, replace): void;
    }
    var history: History;
}
declare module Backbone.Helpers {
    var urlError: () => void;
    var wrapError: (model: any, options: any) => void;
}
declare module Backbone {
    var VERSION: string;
    var $: JQueryStatic;
    var emulateHTTP: boolean;
    var emulateJSON: boolean;
}
