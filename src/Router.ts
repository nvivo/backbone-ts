﻿/// <reference path="_references.ts" />

module Backbone {

    export interface RouterOptions {
        routes: any;
    }

    var optionalParam = /\((.*?)\)/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    // Backbone.Router
    // ---------------

    // Routers map faux-URLs to actions, and fire events when routes are
    // matched. Creating a new one sets its `routes` hash, if not set statically.

    export class Router extends EventBase {

        static extend;

        constructor(options?: RouterOptions) {
            super();
            options || (options = <any> {});
            if (options.routes) this.routes = options.routes;
            this._bindRoutes();
            this.initialize.apply(this, arguments);
        }

        routes;

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize() { }

        // Manually bind a single named route to a callback. For example:
        //
        //     this.route('search/:query/p:num', 'search', function(query, num) {
        //       ...
        //     });
        //
        route(route: string, name: string, callback?: (...parameter: any[]) => void ): Router
        route(route: any, name: any, callback?: any): Router {
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }
            if (!callback) callback = this[name];
            var router = this;
            Backbone.history.route(route, function (fragment) {
                var args = router._extractParameters(route, fragment);
                callback && callback.apply(router, args);
                router.trigger.apply(router, ['route:' + name].concat(args));
                router.trigger('route', name, args);
                Backbone.history.trigger('route', router, name, args);
            });
            return this;
        }

        // Simple proxy to `Backbone.history` to save a fragment into the history.
        navigate(fragment: string, options?: HistoryNavigateOptions): Router {
            Backbone.history.navigate(fragment, options);
            return this;
        }

        // Bind all defined routes to `Backbone.history`. We have to reverse the
        // order of the routes here to support behavior where the most general
        // routes can be defined at the bottom of the route map.
        _bindRoutes(): void {
            if (!this.routes) return;
            this.routes = _.result(this, 'routes');
            var route, routes = _.keys(this.routes);
            while ((route = routes.pop()) != null) {
                this.route(route, this.routes[route]);
            }
        }

        // Convert a route string into a regular expression, suitable for matching
        // against the current location hash.
        _routeToRegExp(route: string): RegExp {
            route = route.replace(escapeRegExp, '\\$&')
                .replace(optionalParam, '(?:$1)?')
                .replace(namedParam, function (match, optional) {
                    return optional ? match : '([^\/]+)';
                })
                .replace(splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        }

        // Given a route, and a URL fragment that it matches, return the array of
        // extracted decoded parameters. Empty or unmatched parameters will be
        // treated as `null` to normalize cross-browser behavior.
        _extractParameters(route: RegExp, fragment: string): string[] {
            var params = route.exec(fragment).slice(1);
            return _.map(params, function (param) {
                return param ? decodeURIComponent(param) : null;
            });
        }
    }
}
