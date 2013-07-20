declare module Backbone {
    class EventBase {
        public _events;
        public _listeners;
        public on(name: string, callback: (...args: any[]) => void, context?: any): any;
        public once(name: string, callback: (...args: any[]) => void, context?: any): any;
        public off(name?: string, callback?: (...args: any[]) => void, context?: any): any;
        public trigger(name: string, ...args: any[]): any;
        public stopListening(obj?: any, name?: string, callback?: (...args: any[]) => void): any;
        public listenTo(name: string, callback: (...args: any[]) => void, context?: any): any;
        public listenToOnce(name: string, callback: (...args: any[]) => void, context?: any): any;
    }
    var Events: {};
}
declare module Backbone {
    interface ModelSetOptions extends Backbone.SilentOptions, Backbone.ValidateOptions {
    }
    interface ModelFetchOptions extends Backbone.PersistenceOptions, ModelSetOptions, Backbone.ParseOptions {
    }
    interface ModelSaveOptions extends Backbone.SilentOptions, Backbone.WaitOptions, Backbone.ValidateOptions, Backbone.ParseOptions, Backbone.PersistenceOptions {
        patch?: boolean;
    }
    interface ModelDestroyOptions extends Backbone.WaitOptions, Backbone.PersistenceOptions {
    }
    interface ModelOptions extends Backbone.ParseOptions {
        collection?: Backbone.Collection;
        _attrs?;
    }
    class Model extends Backbone.EventBase {
        static extend;
        constructor(attributes?, options?: ModelOptions);
        public attributes: any;
        public cid: string;
        public collection: Backbone.Collection;
        public id;
        public validate: (attributes: any, options: any) => boolean;
        public _changing;
        public _pending;
        public _previousAttributes;
        public _parse;
        public changed;
        public validationError;
        public idAttribute: string;
        public initialize(attributes?: any, options?: ModelOptions): void;
        public toJSON(options?: any);
        public sync(...args): any;
        public get(attr: string): any;
        public escape(attr: string): string;
        public has(attr: string): boolean;
        public set(key: string, val: any, options?: ModelSetOptions): any;
        public set(obj: any, options?: ModelSetOptions): any;
        public unset(attr: string, options?: Backbone.SilentOptions);
        public clear(options?: Backbone.SilentOptions);
        public hasChanged(attr?: string): boolean;
        public changedAttributes(diff: any): any;
        public previous(attr: string): any;
        public previousAttributes(): any;
        public fetch(options?: ModelFetchOptions): JQueryXHR;
        public save(attributes: any, options?: ModelSaveOptions): any;
        public destroy(options?: ModelDestroyOptions);
        public url();
        public parse(resp?: any, options?: any);
        public clone(): Model;
        public isNew(): boolean;
        public isValid(options?: any): boolean;
        public _validate(attrs: any, options: any): boolean;
        public keys: () => string[];
        public values: () => any[];
        public pairs: () => any[];
        public invert: () => any;
        public pick: (keys: string[]) => any;
        public omit: (keys: string[]) => any;
    }
}
declare module Backbone {
    interface CollectionOptions {
        comparator?;
        model?: Backbone.Model;
    }
    interface CollectionAddOptions extends Backbone.SilentOptions {
        at?: number;
    }
    interface CollectionRemoveOptions extends Backbone.SilentOptions {
        index?: number;
    }
    interface CollectionSetOptions extends Backbone.ParseOptions, Backbone.SilentOptions {
        add?;
        merge?;
        remove?;
        sort?;
        at?;
        _attrs?;
    }
    interface CollectionResetOptions extends Backbone.SilentOptions {
        previousModels?;
    }
    interface CollectionFetchOptions extends Backbone.PersistenceOptions, Backbone.ParseOptions {
        reset?: boolean;
    }
    class Collection extends Backbone.EventBase {
        static extend;
        constructor(models?: Backbone.Model[], options?: CollectionOptions);
        public comparator: any;
        public length: number;
        public models: Backbone.Model[];
        public _byId;
        public model;
        public initialize(): void;
        public toJSON(options?: any);
        public sync(...args);
        public add(model: Backbone.Model, options?: CollectionAddOptions): any;
        public add(models: Backbone.Model[], options?: CollectionAddOptions): any;
        public remove(model: Backbone.Model, options?: CollectionRemoveOptions): any;
        public remove(models: Backbone.Model[], options?: CollectionRemoveOptions): any;
        public set(models: Backbone.Model[], options?: CollectionSetOptions): Collection;
        public reset(models: Backbone.Model[], options?: CollectionResetOptions): Collection;
        public push(model: Backbone.Model, options?: CollectionAddOptions): Backbone.Model;
        public pop(options?: Backbone.SilentOptions): Backbone.Model;
        public unshift(model: Backbone.Model, options?: CollectionAddOptions): Backbone.Model;
        public shift(options?: Backbone.SilentOptions): Backbone.Model;
        public slice(): any[];
        public get(obj: any): Backbone.Model;
        public at(index: number): Backbone.Model;
        public where(attrs: any, first: boolean): Backbone.Model[];
        public findWhere(attrs: any): Backbone.Model;
        public sort(options?: Backbone.SilentOptions): Collection;
        public sortedIndex(model: Backbone.Model, value: (model: Backbone.Model) => any, context): number;
        public pluck(attr: any): any;
        public fetch(options?: CollectionFetchOptions): JQueryXHR;
        public create(model: any, options?: Backbone.ModelSaveOptions): Backbone.Model;
        public parse(resp: any, options: any): any;
        public clone(): Collection;
        public _reset(): void;
        public _prepareModel(attrs?: any, options?: Backbone.ModelOptions): Backbone.Model;
        public _removeReference(model: Backbone.Model): void;
        public _onModelEvent(event: string, model: Backbone.Model, collection: Collection, options: any): void;
        public all: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => boolean;
        public any: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => boolean;
        public collect: (iterator: (element: Backbone.Model, index: number, context?: any) => any[], context?: any) => any[];
        public chain: () => any;
        public compact: () => Backbone.Model[];
        public contains: (value: any) => boolean;
        public countBy: (iterator: (element: Backbone.Model, index: number) => any) => any[];
        public detect: (iterator: (item: any) => boolean, context?: any) => any;
        public difference: (...model: Backbone.Model[]) => Backbone.Model[];
        public drop: (n?: number) => Backbone.Model[];
        public each: (iterator: (element: Backbone.Model, index: number, list?: any) => void, context?: any) => void;
        public every: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => boolean;
        public filter: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => Backbone.Model[];
        public find: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => Backbone.Model;
        public first: (n?: number) => Backbone.Model[];
        public flatten: (shallow?: boolean) => Backbone.Model[];
        public foldl: (iterator: (memo: any, element: Backbone.Model, index: number) => any, initialMemo: any, context?: any) => any;
        public forEach: (iterator: (element: Backbone.Model, index: number, list?: any) => void, context?: any) => void;
        public include: (value: any) => boolean;
        public indexOf: (element: Backbone.Model, isSorted?: boolean) => number;
        public initial: (n?: number) => Backbone.Model[];
        public inject: (iterator: (memo: any, element: Backbone.Model, index: number) => any, initialMemo: any, context?: any) => any;
        public intersection: (...model: Backbone.Model[]) => Backbone.Model[];
        public isEmpty: (object: any) => boolean;
        public invoke: (methodName: string, arguments?: any[]) => any;
        public last: (n?: number) => Backbone.Model[];
        public lastIndexOf: (element: Backbone.Model, fromIndex?: number) => number;
        public map: (iterator: (element: Backbone.Model, index: number, context?: any) => any[], context?: any) => any[];
        public max: (iterator?: (element: Backbone.Model, index: number) => any, context?: any) => Backbone.Model;
        public min: (iterator?: (element: Backbone.Model, index: number) => any, context?: any) => Backbone.Model;
        public object: (...values: any[]) => any[];
        public reduce: (iterator: (memo: any, element: Backbone.Model, index: number) => any, initialMemo: any, context?: any) => any;
        public select: (iterator: any, context?: any) => any[];
        public size: () => number;
        public shuffle: () => any[];
        public some: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => boolean;
        public sortBy: (iterator: (element: Backbone.Model, index: number) => number, context?: any) => Backbone.Model[];
        public reduceRight: (iterator: (memo: any, element: Backbone.Model, index: number) => any, initialMemo: any, context?: any) => any[];
        public reject: (iterator: (element: Backbone.Model, index: number) => boolean, context?: any) => Backbone.Model[];
        public rest: (n?: number) => Backbone.Model[];
        public tail: (n?: number) => Backbone.Model[];
        public toArray: () => any[];
        public union: (...model: Backbone.Model[]) => Backbone.Model[];
        public uniq: (isSorted?: boolean, iterator?: (element: Backbone.Model, index: number) => boolean) => Backbone.Model[];
        public without: (...values: any[]) => Backbone.Model[];
        public zip: (...model: Backbone.Model[]) => Backbone.Model[];
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
    interface RouterOptions {
        routes: any;
    }
    class Router extends Backbone.EventBase {
        static extend;
        constructor(options?: RouterOptions);
        public routes;
        public initialize(): void;
        public route(route: string, name: string, callback?: (...parameter: any[]) => void): Router;
        public navigate(fragment: string, options?: Backbone.HistoryNavigateOptions): Router;
        public _bindRoutes(): void;
        public _routeToRegExp(route: string): RegExp;
        public _extractParameters(route: RegExp, fragment: string): string[];
    }
}
declare module Backbone {
    interface HistoryStartOptions extends Backbone.SilentOptions {
        pushState?: boolean;
        root?: string;
    }
    interface HistoryNavigateOptions {
        replace: boolean;
        trigger: boolean;
    }
    class History extends Backbone.EventBase {
        static extend;
        constructor();
        public fragment;
        public handlers: any[];
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
        public getHash(window?: Window): string;
        public getFragment(fragment?: string, forcePushState?: boolean): string;
        public start(options?: HistoryStartOptions): boolean;
        public stop(): void;
        public route(route, callback): void;
        public checkUrl(e): any;
        public loadUrl(fragmentOverride?: string): boolean;
        public navigate(fragment: string, options?: HistoryNavigateOptions): any;
        public _updateHash(location: Location, fragment: string, replace: boolean): void;
    }
    var history: History;
}
declare module Backbone.Helpers {
    var extend: (protoProps: any, staticProps: any) => any;
    var urlError: () => void;
    var wrapError: (model: any, options: any) => void;
}
declare module Backbone {
    interface SilentOptions {
        silent?: boolean;
    }
    interface ValidateOptions {
        validate?: boolean;
    }
    interface WaitOptions {
        wait?: boolean;
    }
    interface ParseOptions {
        parse?: boolean;
    }
    interface PersistenceOptions {
        url?: string;
        beforeSend?: (jqxhr: JQueryXHR) => void;
        success?: (modelOrCollection?: any, response?: any, options?: any) => void;
        error?: (modelOrCollection?: any, jqxhr?: JQueryXHR, options?: any) => void;
    }
    var VERSION: string;
    var $: JQueryStatic;
    var emulateHTTP: boolean;
    var emulateJSON: boolean;
}
