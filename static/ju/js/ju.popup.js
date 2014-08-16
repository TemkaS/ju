/**
 * ju framework © darkslave.net 
 * https://github.com/darkslave86/ju
 */
(function(window, ju, $) {
    "use strict";

    if (ju == null || $ == null)
        throw new Error('Dependencies are not resolved');


    var ATTR_POPUP_ID = 'data-popup-id';
    var p = {};

    p.$overlay   = $('<div />').css({
        position:   "fixed",
        margin:     "0px",
        padding:    "0px",
        border:     "0px none",
        left:       "0px",
        top:        "0px",
        zIndex:     "1000000",
        overflow:   "hidden"
    }).hide();

    p.$viewport  = $('<div />').css({
        position:   "fixed",
        margin:     "0px",
        padding:    "0px",
        border:     "0px none",
        left:       "0px",
        top:        "0px",
        zIndex:     "1001000",
        overflow:   "auto",
        background: "transparent"
    }).hide();

    p.$container = $('<div />').css({
        position:   "relative",
        margin:     "0px",
        padding:    "0px",
        border:     "0px none",
        overflow:   "visible",
        background: "transparent"
    });

    p.defaultOverflow  = null;

    p.screenDimensions = {
        width:  window.screen.width  - 32,
        height: window.screen.height - 32
    };

    p.scrollWidth = null;
    p.marginRight = null;

    p.$html  = null;
    p.$body  = null;
    p._html  = null;

    p.openWhenLoaded = false;
    p.opened = false;
    p.loaded = false;

    p.inst  = {};
    p.stack = [];



    /**
     * Добавить активное окно в стек
     */
    p.insert = function(inst, indx) {
        var count = p.stack.length,
            where = count,
            index = 0;

        while (index < count) {
            var item = p.stack[index];

            if (item.inst == inst)
                return;

            if (index < where && item.indx <= indx)
                where = index;

            index++;
        }

        p.stack.splice(where, 0, {
            inst:  inst,
            indx:  indx
        });

        if (where != 0)
            return;

        var prev = p.get(1);

        if (prev != null)
            prev.__hide();

        p.openActive();
    };


    /**
     * Удалить окна из стека
     */
    p.remove = function(inst) {
        var count = p.stack.length,
            index = 0;

        while (index < count) {
            var item = p.stack[index];

            if (item.inst == inst)
                break;

            index++;
        }

        if (index == count)
            return;

        p.stack.splice(index, 1);

        if (index != 0)
            return;

        inst.__hide();
        p.openActive();
    };


    /**
     * Получить активное окно
     */
    p.active = function() {
        return p.get(0);
    };


    /**
     * Получить окно с указанным индексом
     */
    p.get = function(index) {
        var node = p.stack[index];

        if (node != null)
            return node.inst;

        return null;
    };


    /**
     * Отобразить активное окно
     */
    p.openActive = function() {
        var inst = p.active();

        if (inst == null) {
            p.containerHide();
            return;
        }

        p.$overlay.prop('className', inst.__prop.overlayClass);
        p.$container.css(p.screenDimensions);

        inst.__show();

        p.containerShow();
    };



    /**
     * Инициализация контейнера окон
     */
    p.onload = function(e) {
        p.$html = $('html');
        p.$body = $('body');
        p._html = p.$html[0];


        /**
         * определение ширины полосы прокрутки
         */
        p.defaultOverflow = p.$html.css('overflow');

        p.$html.css('overflow', 'hidden');
        p.scrollWidth = p._html.clientWidth;

        p.$html.css('overflow', 'scroll');
        p.scrollWidth-= p._html.clientWidth;

        p.$html.css('overflow', p.defaultOverflow);


        /**
         * подписка на события изменения размера окна и нажатия клавиш
         */
        $(window).bind('resize deviceorientation', p.onresize);
        $(document).bind('keyup', p.onkeyup);


        /**
         * добавление контейнеров в документ
         */
        p.$container.appendTo(p.$viewport);
        p.$viewport .appendTo(p.$body);
        p.$overlay  .appendTo(p.$body);

        p.loaded = true;


        if (p.openWhenLoaded)
            p.containerShow();

    };


    /**
     * Обработчик изменения размеров окна
     */
    p.onresize = function(e) {
        if (!p.opened)
            return;

        var view = {
            width:  p._html.clientWidth,
            height: p._html.clientHeight
        };

        p.$overlay.css(view);
        p.$viewport.css(view);

        var inst = p.active();

        if (inst == null) {
            p.$container.css(view);
            return;
        }

        var item = {
            width:  inst.__content.outerWidth(true),
            height: inst.__content.outerHeight(true)
        };

        var offs = {
            left:   Math.max(0, (view.width  - item.width ) >> 1),
            top:    Math.max(0, (view.height - item.height) >> 1)
        };

        var cont = {
            width:  item.width  + offs.left + 1,
            height: item.height + offs.top  + 1
        };

        p.$container.css(cont);

        inst.__content.css(offs);
        inst.__update();
    };


    /**
     * Обработчик нажатия клавиш
     */
    p.onkeyup = function(e) {
        if (e.keyCode == 27) {
            var inst = p.active();
            if (inst != null && inst.__prop.closeByEsc)
                inst.close();
        }
    };


    /**
     * Отобразить полосы прокрутки браузера
     */
    p.scrollbarShow = function() {
        if (p.marginRight != null)
            p.$body.css('marginRight', p.marginRight);

        p.$html.css('overflow', p.defaultOverflow);
    };


    /**
     * Скрыть полосы прокрутки браузера
     */
    p.scrollbarHide = function() {
        if (p._html.clientHeight < p._html.scrollHeight) {
            p.marginRight = ju.toFloat(p.$body.css('marginRight'));
            p.$body.css('marginRight', p.marginRight + p.scrollWidth);
        } else {
            p.marginRight = null;
        }

        p.$html.css('overflow', 'hidden');
    };


    /**
     * Отобразить контейнер окон
     */
    p.containerShow = function() {
        if (!p.loaded) {
            p.openWhenLoaded = true;
            return;
        }

        if (!p.opened) {
            p.scrollbarHide();
            p.$overlay.show();
            p.$viewport.show();
        }

        p.opened = true;
        p.onresize();
    };


    /**
     * Скрыть контейнер окон
     */
    p.containerHide = function() {
        if (!p.loaded) {
            p.openWhenLoaded = false;
            return;
        }

        if (p.opened) {
            p.$viewport.hide();
            p.$overlay.hide();
            p.scrollbarShow();
        }

        p.opened = false;
    };



    /**
     * Класс всплывающих окон
     */
    function Popup(init, content) {
        if (!ju.isObject(init))
            throw new Error('Init is not an object');

        this.__content = $(content || init.content);

        if (Popup.find(this.__content) != null)
            throw new Error('Instance is already initialized');


        var that = this;

        this.__id = ju.unique();
        this.__prop = {};

        this.__created = false;
        this.__removed = false;

        this.__opened  = false;
        this.__active  = false;

        this.__callclose = function() {
            that.close();
        };


        this.prop($.extend({
            contentClass:  "ju-popup",
            overlayClass:  "ju-popup-overlay",
            createOnFirst: true,
            removeOnClose: false,
            closeByEsc:    true,
            closeBy:       ".close",
            zIndex:        0
        }, init));


        this.__content.hide()
        .css({
            position: "absolute",
            left:     "-9999px",
            top:      "-9999px"
        })
        .appendTo(p.$container);


        if (!this.__prop.createOnFirst)
            this.__create();


        this.__content.attr(ATTR_POPUP_ID, this.__id);
        p.inst[this.__id] = this;
    }


    /**
     * Получить объект окна по целевому элементу
     */
    Popup.find = function(target) {
        var $target = $(target);

        if ($target.length == 0)
            throw new Error('Target element is not found');

        if ($target.length >= 2)
            throw new Error('Target element is ambiguous');

        return p.inst[$target.attr(ATTR_POPUP_ID)];
    };


    /**
     * Открыто ли текущее окно
     */
    Popup.prototype.isOpened = function() {
        return this.__opened;
    };


    /**
     * Активно ли текущее окно
     */
    Popup.prototype.isActive = function() {
        return this.__active;
    };


    /**
     * Создано ли текущее окно
     */
    Popup.prototype.isCreated = function() {
        return this.__created;
    };


    /**
     * Удалено ли текущее окно
     */
    Popup.prototype.isRemoved = function() {
        return this.__removed;
    };


    /**
     * Доступ к элементам внутри окна
     */
    Popup.prototype.content = function(selector) {
        return ju.isset(selector)
                  ? this.__content.find(selector)
                  : this.__content;
    };


    /**
     * Установка и получение параметров окна
     */
    Popup.prototype.prop = function(name, value) {
        if (ju.isObject(name)) {
            for (var i in name)
                this.prop(i, name[i]);
            return this;
        }

        if (!ju.isset(value))
            return this.__prop[name];

        switch (name) {
            case 'onOpen':
            case 'onClose':
            case 'onUpdate':
            case 'onCreate':
            case 'onRemove':
                if (!ju.isFunction(value))
                    throw new Error(name + ' is not a function');
                this.__prop[name] = value;
            break;

            case 'createOnFirst':
            case 'removeOnClose':
            case 'closeByEsc':
                this.__prop[name] = !!value;
            break;

            case 'overlayClass':
                this.__prop[name] = value;
            break;

            case 'contentClass':
                this.content().prop('className', value);
                this.__prop[name] = value;
            break;

            case 'closeBy':
                var other = this.__prop[name];

                if (other != null) {
                    this.content(other).unbind('click', this.__callclose);
                }

                if (value != null) {
                    this.content(value).bind('click', this.__callclose);
                }

                this.__prop[name] = value;
            break;

            case 'zIndex':
                this.__prop[name] = ~~value;
            break;
        }

        return this;
    };


    /**
     * Открыть окно
     */
    Popup.prototype.open = function() {
        if (this.__opened)
            return this;

        if (this.__removed)
            throw new Error('Instance is already removed');

        if (!this.__created)
            this.__create();

        this.__open();

        return this;
    };


    /**
     * Закрыть окно
     */
    Popup.prototype.close = function() {
        if (this.__opened && !this.__close())
            return this;

        if (this.__prop.removeOnClose && !this.__removed)
            this.__remove();

        return this;
    };


    /**
     * Обновить окно
     */
    Popup.prototype.update = function() {
        if (this.__active)
            p.onresize();
        return this;
    };


    /**
     * Удалить окно
     */
    Popup.prototype.remove = function() {
        if (this.__removed)
            return this;

        if (this.__opened)
            this.__close(true);

        this.__remove();

        return this;
    };


    /**
     * Приватные функции
     */
    Popup.prototype.__show = function() {
        this.__content.show();
        this.__active = true;
    };


    Popup.prototype.__hide = function() {
        this.__content.hide();
        this.__active = false;
    };


    Popup.prototype.__update = function() {
         if (this.__prop.onUpdate) {
             this.__prop.onUpdate.call(this);
         }
    };


    Popup.prototype.__create = function() {
        if (this.__prop.onCreate) {
            this.__content.show();
            this.__prop.onCreate.call(this);
            this.__content.hide();
        }

        this.__created = true;
    };


    Popup.prototype.__remove = function() {
        if (this.__prop.onRemove) {
            this.__prop.onRemove.call(this);
        }

        delete p.inst[this.__id];
        this.__content.remove();

        this.__removed = true;
    };


    Popup.prototype.__open = function() {
        if (this.__prop.onOpen) {
            var result = this.__prop.onOpen.apply(this, arguments);
            if (result === false)
                return false;
        }

        p.insert(this, this.__prop.zIndex);

        this.__opened = true;
        return true;
    };


    Popup.prototype.__close = function(ignore) {
        if (this.__prop.onClose) {
            var result = this.__prop.onClose.apply(this, arguments);
            if (!ignore && result === false)
                return false;
        }

        p.remove(this);

        this.__opened = false;
        return true;
    };



    /**
     * Доступ через jQuery интерфейс
     */
    $.fn.juPopup = function(init) {
        if (ju.isset(init))
            return new Popup(init, this);

        var inst = Popup.find(this);

        if (inst == null)
            throw new Error('Instance is not initialized');

        return inst;
    };


    /**
     * Функция заглушка
     */
    function openThrowError() {
        throw new Error('Unable to call open method');
    }
    

    /**
     * Очередь всплывающих окон
     */
    function Queue(callback) {
        var that = this;

        if (callback != null && !ju.isFunction(callback))
            throw new Error('Callback is not a function');

        this.__queue  = [];
        this.__active = null;

        this.__callnext = function() {
            var callback = this.__prop.onClose = this.__temp_onClose;
            if (callback)
                callback.apply(this, arguments);
            that.__next();
        };

        this.__callback = callback;
    }

    Popup.Queue = Queue;


    /**
     * Показать следующее окно в очереди
     */
    Queue.prototype.__next = function() {
        if (this.__active = this.__queue.shift()) {
            this.__active.__temp_open();
            return true;
        }

        if (this.__callback)
            this.__callback.call(null);

        return true;
    };


    /**
     * Добавить окно в очередь
     */
    Queue.prototype.push = function(inst) {
        if (inst.__opened)
            throw new Error('Instance is already opened');

        if (inst.open === openThrowError)
            throw new Error('Instance is already in queue');

        inst.__temp_onClose = inst.__prop.onClose;
        inst.__prop.onClose = this.__callnext;

        inst.__temp_open = inst.open;
        inst.open = openThrowError;

        this.__queue.push(inst);

        return this;
    };


    /**
     * Открыть очередь окон
     */
    Queue.prototype.open = function() {
        if (!this.__active)
            this.__next();

        return this;
    };


    /**
     * Закрыть очередь окон
     */
    Queue.prototype.done = function() {
        var inst = this.__active;

        while (inst) {
            inst.__prop.onClose = inst.__temp_onClose;
            inst.close();
            inst = this.__queue.shift();
        }

        if (this.__callback)
            this.__callback.apply(null, arguments);

        return this;
    };



    /**
     * Экспорт классов
     */
    ju.Popup = Popup;

    /**
     * Подписка на событие загрузки
     */
    $(p.onload);

})(window, window.ju, window.jQuery);