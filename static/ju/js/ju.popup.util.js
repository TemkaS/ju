/**
 * ju framework © darkslave.net 
 * https://github.com/darkslave86/ju
 */
(function(window, ju, $) {
    "use strict";

    if (ju == null || $ == null)
        throw new Error('Dependencies are not resolved');


    /***********************************************************************************************
     * Пользовательское сообщение
     */
    function Message(/* text [ , type ] [ , callback ] | init [ , callback ] */) {
        var callbackOffset = 1,
            init = {};

        if (ju.isObject(arguments[0])) {
            init = arguments[0];
        } else
        if (ju.isString(arguments[0])) {
            init.text = arguments[0];
        } else {
            throw new Error('Parameter is not an object or a string');
        }

        if (ju.isString(arguments[1])) {
            init.type = arguments[1];
            callbackOffset++;
        }

        var callback = arguments[callbackOffset];

        if (callback != null) {
            if (!ju.isFunction(callback))
                throw new Error('Callback is not a function');
            init.onClose = callback;
        }

        var type = init.type || "default";

        var prop = $.extend(
                {},
                Message.prop,
                Message.propByType[type] || {},
                init
            );

        prop.contentClass += ' ' + type;
        prop.overlayClass += ' ' + type;
        prop.removeOnClose = true;
        prop.zIndex        = 1000000;

        var content = $('<div />')
        .html(ju.template(prop.template, {
            title: prop.title,
            close: prop.close,
            text:  prop.text
        }));

        var message = new ju.Popup(prop, content);

        Message.__queue.push(message).open();

        return message;
    }

    /**
     * Очередь сообщений
     */
    Message.__queue = new ju.Popup.Queue();

    /**
     * Параметры по умолчанию
     */
    Message.prop = {
        contentClass:  "ju-popup ju-message",
        overlayClass:  "ju-popup-overlay",
        closeByEsc:    true,
        title:         "Сообщение",
        close:         "Закрыть",
        text:          "&nbsp;",
        template:
            '<div class="header">{{title}}</div>' +
            '<div class="content">{{text}}</div>' +
            '<div class="footer">'  +
                '<input type="button" class="button close" value="{{close}}" />' +
            '</div>'
    };

    /**
     * Параметры по умолчанию в зависимости от типа
     */
    Message.propByType = {
        'error':   {
            title:     "Ошибка"
        }
    };

    /**
     * Экспорт
     */
    ju.Message = Message;

    ju.Notice  = function(text, callback) {
        return Message(text, 'notice', callback);
    };

    ju.Error   = function(text, callback) {
        return Message(text, 'error', callback);
    };




    /***********************************************************************************************
     * Подтверждение действия
     */
    function Confirm(init /* , callbacks */) {
        if (!ju.isObject(init))
            throw new Error('Init is not an object');

        var type = init.type || "default";

        var prop = $.extend(
                {},
                Confirm.prop,
                Confirm.propByType[type] || {},
                init
            );

        if (!ju.isArray(prop.buttons))
            throw new Error('Buttons is not an array');

        prop.contentClass += ' ' + type;
        prop.overlayClass += ' ' + type;

        var content = $('<div />')
        .html(ju.template(prop.template, {
            title: prop.title,
            text:  prop.text
        }));

        var buttons = content.find('.buttons');

        if (prop.buttons.length > 0) {
            var args = arguments;

            if (buttons.length == 0)
                throw new Error('Buttons container is not found');

            if (buttons.length >= 2)
                throw new Error('Buttons container is ambiguous');

            ju.forEach(prop.buttons, function(index, title) {
                var callback = args[index + 1];

                if (callback != null && !ju.isFunction(callback))
                    throw new Error('Callback #' + (index + 1) + ' is not a function');

                $('<input type="button" class="button" />')
                    .attr('value', title)
                    .click(function() {
                        if (!callback || callback.call(message) !== false)
                            message.close();
                    })
                    .appendTo(buttons);
            });
        }

        var message = new ju.Popup(prop, content);

        return message;
    }

    /**
     * Параметры по умолчанию
     */
    Confirm.prop = {
        contentClass:  "ju-popup ju-confirm",
        overlayClass:  "ju-popup-overlay",
        removeOnClose: true,
        closeByEsc:    true,
        buttons:       ["Отмена"],
        title:         "&nbsp;",
        text:          "&nbsp;",
        template:
            '<div class="header">{{title}}</div>' +
            '<div class="content">{{text}}</div>' +
            '<div class="footer buttons"></div>'
    };

    /**
     * Параметры по умолчанию в зависимости от типа
     */
    Confirm.propByType = {};

    /**
     * Экспорт
     */
    ju.Confirm = Confirm;



    /***********************************************************************************************
     * Сообщение о загрузке
     */
    function Spinner(/* text [ , type ] | init */) {
        var init = {};

        if (ju.isObject(arguments[0])) {
            init = arguments[0];
        } else
        if (ju.isString(arguments[0])) {
            init.text = arguments[0];
        }

        if (ju.isString(arguments[1])) {
            init.type = arguments[1];
        }

        var type = init.type || "default";

        var prop = $.extend(
                {},
                Spinner.prop,
                Spinner.propByType[type] || {},
                init
            );

        prop.contentClass += ' ' + type;
        prop.overlayClass += ' ' + type;
        prop.removeOnClose = true;
        prop.zIndex        = 100000;

        var content = $('<div />')
        .html(ju.template(prop.template, {
            text:  prop.text
        }));

        var message = new ju.Popup(prop, content);

        return message;
    }

    /**
     * Параметры по умолчанию
     */
    Spinner.prop = {
        contentClass:  "ju-popup ju-spinner",
        overlayClass:  "ju-popup-overlay",
        text:          "Пожалуйста подождите",
        template:      '<div class="content">{{text}}</div>'
    };

    /**
     * Параметры по умолчанию в зависимости от типа
     */
    Spinner.propByType = {};

    /**
     * Экспорт
     */
    ju.Spinner = Spinner;



})(window, window.ju, window.jQuery);