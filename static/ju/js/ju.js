/**
 * ju framework © darkslave.net 
 * https://github.com/darkslave86/ju
 */
(function(window, document) {
    "use strict";

    if (document == null)
        throw new Error('Document is not defined');


    var ju = {};


    /**
     *  Проверка типа переменной
     */
    (function() {
        var types = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'],
            check = Object.prototype.toString,
            table = {};

        for (var i = 0; i < types.length; i++)
            table['[object ' + types[i] + ']'] = types[i].toLowerCase();

        ju.type = function(obj) {
            if (obj == null)
                return String(obj);

            var type = typeof obj;

            if (type !== 'object')
                return type;

            return table[ check.call(obj) ] || 'object';
        };

    })();



    /**
     *  Проверка установлена ли переменная
     */
    ju.isset = function(obj) {
        return typeof obj  !== 'undefined';
    };

    /**
     * Проверка типов переменных
     */
    ju.isBoolean = function(obj) {
        return ju.type(obj) === 'boolean';
    };

    ju.isNumber = function(obj) {
        return ju.type(obj) === 'number';
    };

    ju.isString = function(obj) {
        return ju.type(obj) === 'string';
    };

    ju.isFunction = function(obj) {
        return ju.type(obj) === 'function';
    };

    ju.isArray = function(obj) {
        return ju.type(obj) === 'array';
    };

    ju.isDate = function(obj) {
        return ju.type(obj) === 'date';
    };

    ju.isRegExp = function(obj) {
        return ju.type(obj) === 'regexp';
    };

    ju.isObject = function(obj) {
        return ju.type(obj) === 'object';
    };

    ju.isError = function(obj) {
        return ju.type(obj) === 'error';
    };



    /**
     * Пустая функция
     */
    ju.noop = function() {};

    /**
     * Функция, которая возвращает "истину"
     */
    ju.returnTrue  = function() { return true;  };

    /**
     * Функция, которая возвращает "ложь"
     */
    ju.returnFalse = function() { return false; };




    /**
     *  Преобразование строки в целое
     */
    ju.toInt = function(source, deft) {
        var temp = parseInt(source, 10);
        return isNaN(temp) ? (deft || 0) : temp;
    };

    /**
     *  Преобразование строки в вещественное
     */
    ju.toFloat = function(source, deft) {
        var temp = parseFloat(source);
        return isNaN(temp) ? (deft || 0) : temp;
    };



    /**
     * Случайное число в указанном диапазоне
     */
    ju.random = function(Min, Max) {
        return Max ? Math.floor(Math.random() * (Max - Min)) + Min
                   : Math.floor(Math.random() * Min);
    };



    /**
     * Текущее время в миллисекундах
     */
    ju.time = function() {
        return new Date().getTime();
    };



    /**
     * Случайный идентификатор
     */
    ju.unique = function() {
        var result = "ju";
        result+= ((0xffffffff * Math.random()) >>> 4) & 0x7fffff;
        result+= ((0xffffffff * Math.random()) >>> 4) & 0x7fffff;
        return result;
    };



    /**
     * Экранирование html-символов
     */
    ju.escape = function(text) {
        return String(text)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
    };



    /**
     * Преобразование переходов на другую строку в теги <br />
     */
    ju.nl2br = function(text) {
        return String(text)
                .replace(/\r?\n|\r/g, '<br />');
    };



    /**
     * Замена всех вхождений строки
     */
    ju.replaceAll = function(text, f, t) {
        return String(text)
                .split(f)
                .join(t);
    };



    /**
     * Сложение всех элементов списка / объекта через разделитель
     */
    ju.join = function(value, sepp) {
        switch (ju.type(value)) {
            case 'array':
                return value.join(sepp);

            case 'object':
                var result = "",
                    index  = 0;

                for (var key in value) {
                    if (index > 0)
                        result+= sepp;
                    result+= value[key];
                    index++;
                }

                return result;

            default:
                return String(value);
        }
    };



    /**
     * Поиск нужного элемента в списке / объекте, используя строгое или нестрогое сравнение
     */
    ju.contains = function(value, where, strict) {
        switch (ju.type(where)) {
            case 'array':
                var size = where.length;

                if (strict) {
                    for (var i = 0; i < size; i++)
                        if (value === where[i])
                            return true;
                } else {
                    for (var i = 0; i < size; i++)
                        if (value == where[i])
                            return true;
                }

                return false;

            case 'object':
                if (strict) {
                    for (var i in where)
                        if (value === where[i])
                            return true;
                } else {
                    for (var i in where)
                        if (value == where[i])
                            return true;
                }

                return false;

            default:
                return strict ? value === where : value == where;
        }
    };



    /**
     * Повтор строки указанное количество раз
     */
    ju.repeat = function(text, count) {
        var result = "";

        while (--count >= 0)
            result+= text;

        return result;
    };



    /**
     * Повтор строки до указанной длины
     */
    ju.padding = function(obj, size) {
        var text = String(obj);
        return ju.repeat(text, Math.ceil(size / text.length)).substring(0, size);
    };



    /**
     * Заполнение строки слева до указанной длины
     */
    ju.lpad = function(obj, padd, size) {
        var text = String(obj),
            need = size - text.length;
        return need > 0 ? ju.padding(padd, need) + text : text;
    };



    /**
     * Заполнение строки справа до указанной длины
     */
    ju.rpad = function(obj, padd, size) {
        var text = String(obj),
            need = size - text.length;
        return need > 0 ? text + ju.padding(padd, need) : text;
    };



    /**
     * Получение ключей объекта
     */
    ju.keys = function(obj) {
        var result = [];

        for (var key in obj)
            result.push(key);

        return result;
    };


    /**
     * Получение значений объекта
     */
    ju.vals = function(obj) {
        var result = [];

        for (var key in obj)
            result.push(obj[key]);

        return result;
    };


    /**
     * Обход по всем элементам массива / объекта
     */
    ju.forEach = function(source, callback) {
        if (!ju.isFunction(callback))
            throw new Error('Callback is not a function');

        switch (ju.type(source)) {
            case 'array':
                var size = source.length;

                for (var i = 0; i < size; i++)
                    if (callback(i, source[i]) === false)
                        return false;

                return true;

            case 'object':
                for (var i in source)
                    if (callback(i, source[i]) === false)
                        return false;

                return true;

            default:
                throw new Error('Source is not an array or object');
        }

    };



    /**
     * Получение строки по шаблону,
     * все вхождения {{...}} распознаются как подстановочные переменные
     * переменные ищутся в объекте параметров или функции
     */
    ju.template = function(source, params) {
        var isfunc = ju.isFunction(params),
            result = "",
            index  = 0;

        if (!ju.isString(source))
            throw new Error('Source is not a string');

        if (!isfunc && !ju.isObject(params))
            throw new Error('Params must be an object or function');

        while (true) {
            var begin = source.indexOf('{{', index);
            var close = source.indexOf('}}', begin);

            if (begin < 0 || close < 0) {
                result+= source.substring(index);
                break;
            }

            var name  = source.substring(begin + 2, close);
            var value = isfunc ? params(name) : params[name];

            if (ju.isset(value)) {
                result+= source.substring(index, begin);
                result+= value;
            } else {
                result+= source.substring(index, close + 2);
            }

            index = close + 2;
        }

        return result;
    };



    /**
     * Связывание функций конструкторов
     */
    ju.mixin = function(Source, Target) {
        if (!ju.isFunction(Source))
            throw new Error('Source is not a function');

        if (!ju.isFunction(Target))
            throw new Error('Target is not a function');

        var Empty = function() {};
        Empty.prototype = Source.prototype;

        Target.prototype = new Empty();
        Target.prototype.constructor = Target;
        Target.__super__ = Source;

        return Target;
    };



    /**
     * Защелка для выполнения набора некоторых условий
     */
    (function() {

        /**
         *  Конструктор защелки
         */
        function Latch(markers, callback) {
            if (!ju.isArray(markers))
                throw new Error('Markers is not an array');

            if (!ju.isFunction(callback))
                throw new Error('Callback is not a function');

            this.__markers = {};
            this.__results = {};

            var index = markers.length;

            while (--index >= 0) {
                var id = markers[index];
                this.__markers[id] = false;
            }
            
            this.__callback = callback;
            this.__finished = false;
        }


        /**
         * Пометка выполнения одного из условий
         */
        Latch.prototype.mark = function(id, result) {
            if (this.__finished)
                return false;

            if (this.__markers[id])
                return false;

            this.__markers[id] = true;
            this.__results[id] = result;

            for (var id in this.__markers)
                if (!this.__markers[id])
                    return false;

            this.__callback.call(null, this.__results);

            this.__finished = true;
            return true;
        };


        ju.Latch = Latch;

    })();



    /**
     * Вспомогательные функции обработки событий
     */
    (function() {
        var Events = {},
            attach,
            detach;


        if (document.addEventListener) {

            attach = function(node, type, callback, phase) {
                node.addEventListener(type, callback, phase);
            };

            detach = function(node, type, callback, phase) {
                node.removeEventListener(type, callback, phase);
            };

        } else {

            attach = function(node, type, callback, phase) {
                node.attachEvent('on' + type, callback);
            };

            detach = function(node, type, callback, phase) {
                node.detachEvent('on' + type, callback);
            };

        }


        /**
         *  добавление обработчика событий
         */
        Events.attach = function(node, type, callback, phase) {
            if (!ju.isArray(type)) {
                attach(node, type, callback, phase);
                return true;
            }

            var index = type.length;

            while (--index >= 0)
                attach(node, type[index], callback, phase);

            return true;
        };


        /**
         *  Удаление обработчика событий
         */
        Events.detach = function(node, type, callback, phase) {
            if (!ju.isArray(type)) {
                detach(node, type, callback, phase);
                return true;
            }

            var index = type.length;

            while (--index >= 0)
                detach(node, type[index], callback, phase);

            return true;
        };


        /**
         * Остановка распространения события
         */
        Events.stopPropagation = function(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        };


        /**
         * Предотвращение действия по умолчанию
         */
        Events.preventDefault = function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        };


        /**
         * Получение кода символа
         */
        Events.charCode = function(e) {
            if (e.type !== 'keypress')
                return 0;

            if ('charCode' in e)
                return e.charCode;

            return e.keyCode;
        };


        /**
         * Проверка сервисных клавиш
         */
        Events.isServiceKey = function(e) {
            // command keys
            if (e.ctrlKey || e.altKey || e.metaKey)
                return true;

            // characters
            if (Events.charCode(e) >= 32)
                return false;

            // system controls
            if (e.keyCode < 32)
                return true;

            switch (e.keyCode) {
                case  33: // page up
                case  34: // page down
                case  35: // end
                case  36: // home
                case  37: // left
                case  38: // up
                case  39: // right
                case  40: // down
                case  44: // print screen
                case  45: // insert
                case  46: // delete
                case  91: // win 1
                case  92: // win 2
                case  93: // context menu
                case 112: // f1
                case 113: // f2
                case 114: // f3
                case 115: // f4
                case 116: // f5
                case 117: // f6
                case 118: // f7
                case 119: // f8
                case 120: // f9
                case 121: // f10
                case 122: // f11
                case 123: // f12
                case 144: // num lock
                case 145: // scroll lock
                    return true;
            }

            return false;
        };


        /**
         * Проверка клавиш вставки (ctrl + v / shift + insert)
         */
        Events.isPastingKey = function(e) {

            switch (e.charCode || e.keyCode) {
                case  86: // «V»
                case 118: // «v»
                    return e.ctrlKey;

                case  45: // insert
                    if (!e.charCode)
                        return e.shiftKey;
            }

            return false;
        };


        /**
         * Проверка клавиш, изменяющих содержимое
         */
        Events.isChangingKey = function(e) {

            switch (e.keyCode) {
                case  8: // backspace
                case 13: // enter
                case 46: // delete & «.» on keypress
                    return true;
            }

            if (Events.isPastingKey(e))
                return true;

            return !Events.isServiceKey(e);
        };


        ju.Events = Events;

    })();



    /**
     * Регистрация и запуск событий
     */
    (function() {
        var observers = {},
            isReady = false,
            READY   = 'ready';


        function insert(name, callback, context) {
            if (!ju.isString(name))
                throw new Error('Event name is not a string');

            if (!ju.isObject(context))
                context = null;

            if (name === READY && isReady) {
                callback.call(context, name);
                return;
            }

            var list = observers[name] || (observers[name] = []);

            list.push({
                callback: callback,
                context:  context
            });

        }


        /**
         *  Добавление обработчика событий
         */
        ju.on = function(name, callback, context) {
            if (!ju.isFunction(callback))
                throw new Error('Callback is not a function');

            if (!ju.isArray(name)) {
                insert(name, callback, context);
                return true;
            }

            var index = name.length;

            while (--index >= 0)
                insert(name[index], callback, context);

            return true;
        };


        /**
         *  Добавление обработчика при загрузке страницы
         */
        ju.on.ready = function(callback, context) {
            return ju.on(READY, callback, context);
        };


        /**
         *  Запуск обработчиков указанного события
         */
        ju.fire = function(name /* , arguments */) {
            if (!ju.isString(name))
                throw new Error('Event name is not a string');

            if (name === READY)
                throw new Error('Unable to fire this event');

            return fire(arguments);
        };


        function fire(args, clear) {
            var name = args[0];

            if (!observers[name])
                return false;

            var list = observers[name],
                size = list.length;

            if (clear)
                observers[name] = [];

            for (var i = 0; i < size; i++) {
                var item = list[i];
                item.callback.apply(item.context, args);
            }

            return true;
        }


        function onload(e) {
            if (!isReady && (document.addEventListener || document.readyState === 'complete' || window.event.type === 'load')) {
                isReady = true;
                fire([ READY ], true);
                detach();
            }
        }


        /**
         * Обработка событий
         */
        var loaded = document.addEventListener ? 'DOMContentLoaded' : 'onreadystatechange';

        var attach = function() {
            ju.Events.attach(document, loaded, onload, false);
            ju.Events.attach(window,   'load', onload, false);
        };

        var detach = function() {
            ju.Events.detach(document, loaded, onload, false);
            ju.Events.detach(window,   'load', onload, false);
        };

        attach();

    })();




    /**************************************************************************
     * регистрация в amd или window
     */
    if (typeof define === 'function' && define.amd)
        define(ju);

    window.ju = ju;

})(window, window.document);
