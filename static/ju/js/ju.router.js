/**
 * ju framework © darkslave.net
 */
(function(window, ju) {
    "use strict";

    if (ju == null)
        throw new Error('Dependencies are not resolved');

    if (!('onhashchange' in window))
        throw new Error('Future `window.onhashchange` is not supported');


    /**
     * Обертка маршрута
     */
    function Route(path, ctrl) {
        if (!ju.isString(path))
            throw new Error('Route path is not a string');

        if (!ju.isFunction(ctrl))
            throw new Error('Controller is not a function');

        var parts = path.split(/[\\/]/gi),
            count = parts.length;

        if (count > 30)
            throw new Error('Too many path elements');

        var index  = count,
            offset = 0,
            weight = 0;

        while (--index >= 0) {
            if (parts[index].indexOf('*') >= 0)
                weight|= 1 << offset;
            offset++;
        }

        if (weight != 0) {
            var temp = path.replace(/[.+?{}\[\]\(\)\\^$|]/g, '\\$&')
                           .replace(/[*]/g, '(.*?)');
            this.regex = new RegExp('^' + temp + '$');
        } else {
            this.exact = path;
        }

        this.weight = weight;
        this.ctrl   = ctrl;
    }


    Route.prototype.dispatch = function(path) {
        var parts;

        if (this.regex) {
            parts = this.regex.exec(path);
        } else {
            parts = this.exact === path ? [ path ] : null;
        }

        if (parts == null)
            return false;

        this.ctrl.apply(null, parts);

        return true;
    };



    var Router = {};

    Router.__routes = [];


    /**
     * Добавление маршрута в очередь
     */
    Router.add = function(path, ctrl) {
        Router.__routes.push(new Route(path, ctrl));
        Router.__routes.sort(sortByWeight);
    };


    function sortByWeight(a, b) {
        return a.weight - b.weight;
    }


    /**
     * Обработка маршрута
     */
    Router.dispatch = function(path) {
        var count = Router.__routes.length,
            index = 0;

        while (index < count) {
            if (Router.__routes[index].dispatch(path))
                return true;
            index++;
        }

        return false;
    };


    /**
     * Обработка события изменения фрагмента адреса
     */
    Router.onHashChanged = function(e) {
        var parts = window.location.href.match(/#(.*)$/);
        Router.dispatch(parts ? parts[1] : "");
    };


    /**
     * Экспорт классов
     */
    ju.Router = Router;

    /**
     * Навешивание обработчиков
     */
    ju.Events.attach(window, 'hashchange', Router.onHashChanged);

})(window, window.ju);