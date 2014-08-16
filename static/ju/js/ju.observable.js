/**
 * ju framework © darkslave.net 
 * https://github.com/darkslave86/ju
 */
(function(window, ju) {
    "use strict";

    if (ju == null)
        throw new Error('Dependencies are not resolved');


    /**
     * Объект события
     */
    function EventObject(name, target) {
        this.name   = name;
        this.target = target;
        this.forwarded = [];
        this.prevented = false;
    }


    EventObject.prototype.__forward = function(object, params) {
        var index = this.forwarded.length;

        while (--index >= 0) {
            if (this.forwarded[index].object === object)
                throw new Error('Circular event forwarding found');
        }

        this.forwarded.push({
            object: object,
            params: params
        });

        return this;
    };



    /**
     * Объект форвардера событий
     */
    function Forwarder(target, params, filter) {
        if (!ju.isObject(target) || !ju.isFunction(target.__fire))
            throw new Error('Target is not an observable object');

        if (filter != null && !ju.isArray(filter))
            throw new Error('Filter is not an array');

        this.__target = target;
        this.__params = params;
        this.__filter = filter;
    }


    Forwarder.prototype.allowed = function(name) {
        if (!this.__filter)
            return true;

        var index = this.__filter.length;

        while (--index >= 0) {
            if (this.__filter[index] === name)
                return true;
        }

        return false;
    };


    Forwarder.prototype.forward = function(event, args, object) {
        if (!this.allowed(event.name))
            return false;

        event.__forward(object, this.__params);

        this.__target.__fire(event, args);
        return true;
    };



    /**
     * Наблюдаемый объект
     */
    function Observable() {
        this.__observers = {};
        this.__forwarder = null;
    }


    Observable.prototype.on = function(name, callback, context) {
        if (!ju.isFunction(callback))
            throw new Error('Callback is not a function');

        if (!ju.isArray(name)) {
            this.__on(name, callback, context);
            return this;
        }

        var index = name.length;

        while (--index >= 0)
            this.__on(name[index], callback, context);

        return this;
    };


    Observable.prototype.__on = function(name, callback, context) {
        if (!ju.isString(name))
            throw new Error('Event name is not a string');

        if (!ju.isObject(context))
            context = null;

        var list = this.__observers[name] || (this.__observers[name] = []);

        list.push({
            callback: callback,
            context:  context
        });
    };


    Observable.prototype.off = function(callback, context) {
        if (ju.isFunction(callback)) {
            if (!ju.isObject(context))
                context = null;

            for (var name in this.__observers) {
                var list = this.__observers[name],
                    size = list.length;

                while (--size >= 0) {
                    var item = list[size];
                    if (item.callback === callback
                     && item.context  === context )
                        list.splice(size, 1);
                }

            }

            return this;
        }

        if (ju.isString(callback)) {
            if (callback !== '*') {
                delete this.__observers[callback];
            } else {
                this.__observers = {};
            }

            return this;
        }

        throw new Error('Parameter is not a function or an event name');
    };


    Observable.prototype.fire = function(name /* , arguments */) {
        if (!ju.isString(name))
            throw new Error('Event name is not a string');

        var args  = Array.prototype.slice.call(arguments, 0),
            event = new EventObject(name, this);

        args[0] = event;

        return this.__fire(event, args);
    };


    Observable.prototype.__fire = function(event, args) {

        if (this.__observers[event.name]) {
            var list = this.__observers[event.name],
                size = list.length;

            for (var i = 0; i < size; i++) {
                var item = list[i];
                item.callback.apply(item.context, args);
            }
        }

        if (this.__forwarder && !event.prevented)
            this.__forwarder.forward(event, args, this);

        return this;
    };


    Observable.prototype.fwdto = function(target, params, filter) {
        this.__forwarder = new Forwarder(target, params, filter);
        return this;
    };


    Observable.prototype.unfwd = function(target) {
        if (!this.__forwarder)
            return this;

        if (!ju.isset(target) || this.__forwarder.__target === target)
            this.__forwarder = null;

        return this;
    };



    /**
     * Наблюдаемое значение
     */
    function Value() {
        Value.__super__.call(this);
        this.__value = null;
    }

    ju.mixin(Observable, Value);


    Value.prototype.set = function(value) {

        this.__value = value;
        this.fire('set');

        return this;
    };


    Value.prototype.get = function() {
        return this.__value;
    };



    /**
     * Абстрактная коллекция
     */
    function AbstractCollection() {
        AbstractCollection.__super__.call(this);
    }

    ju.mixin(Observable, AbstractCollection);


    AbstractCollection.prototype.__set = function(index, value) {
        if (ju.isObject(value) && ju.isFunction(value.fwdto))
            value.fwdto(this, index);

        this.__value[index] = value;
    };


    AbstractCollection.prototype.__remove = function(index) {
        var value = this.__value[index];

        if (!ju.isset(value))
            return false;

        if (ju.isObject(value) && ju.isFunction(value.unfwd))
            value.unfwd(this);

        return true;
    };


    AbstractCollection.prototype.get = function(index) {
        return this.__value[index];
    };


    AbstractCollection.prototype.isset = function(index) {
        return ju.isset(this.__value[index]);
    };



    /**
     *  Наблюдаемое key-value хранилище элементов
     */
    function Map() {
        Map.__super__.call(this);
        this.__value = {};
    }

    ju.mixin(AbstractCollection, Map);


    Map.prototype.set = function(index, value) {
        if (!ju.isString(index) && !ju.isNumber(index))
            throw new Error('Index `' + index + '` is not valid');

        this.__set(index, value);
        this.fire('set', index);

        return this;
    };


    Map.prototype.remove = function(index) {
        if (!this.__remove(index))
            return false;

        delete this.__value[index];
        this.fire('remove', index);

        return true;
    };


    Map.prototype.clear = function() {

        this.__value = {};
        this.fire('clear');

        return this;
    };


    Map.prototype.each = function(callback) {
        if (!ju.isFunction(callback))
            throw new Error('Callback is not a function');

        for (var index in this.__value)
            if (callback.call(this, index, this.__value[index]) === false)
                break;

        return this;
    };


    Map.prototype.keys = function() {
        var result = [];

        for (var index in this.__value)
            result.push(index);

        return result;
    };



    /**
     * Наблюдаемый список элементов
     */
    function List() {
        List.__super__.call(this);
        this.__value = [];
    }

    ju.mixin(AbstractCollection, List);


    List.prototype.set = function(index, value) {
        if (!ju.isNumber(index) || index < 0 || index > this.__value.length)
            throw new Error('Index `' + index + '` is not valid');

        this.__set(index, value);
        this.fire('set', index);

        return this;
    };


    List.prototype.add = function(value) {
        var index = this.__value.length;

        this.__set(index, value);
        this.fire('add', index);

        return this;
    };


    List.prototype.remove = function(index) {
        if (!this.__remove(index))
            return false;

        this.__value.splice(index, 1);
        this.fire('remove', index);

        return true;
    };


    List.prototype.clear = function() {

        this.__value = [];
        this.fire('clear');

        return this;
    };


    List.prototype.each = function(callback) {
        if (!ju.isFunction(callback))
            throw new Error('Callback is not a function');

        var count = this.__value.length;

        for (var index = 0; index < count; index++)
            if (callback.call(this, index, this.__value[index]) === false)
                break;

        return this;
    };


    List.prototype.size = function() {
        return this.__value.length;
    };



    /**
     * Экспорт классов
     */
    ju.Observable = Observable;

    ju.Value = Value;
    ju.List  = List;
    ju.Map   = Map;

})(window, window.ju);