/**
 * ju framework © darkslave.net
 */
(function(window, ju, $) {
    "use strict";

    if (ju == null || $ == null)
        throw new Error('Dependencies are not resolved');


    /**
     * тип сериализуемого объекта
     */
    function type(obj) {
        var type = ju.type(obj);
        return type === 'object' && typeof obj.length === 'number' &&
               (obj.length === 0 || (obj.length > 0 && (obj.length - 1) in obj))
               ? 'array'
               : type;
    }

    /**
     * добавление объекта в стек вызова
     */
    function push(obj, stack, level) {
        var index = level;

        while (--index >= 0)
            if (stack[index] === obj)
                return true;

        stack[level] = obj;
        return false;
    }

    /**
     * сериализация объекта
     */
    function dump(obj, stack, level) {
        switch (type(obj)) {
            case 'array':
                if (push(obj, stack, level))
                    return "*recursion*";

                var result = "",
                    limit  = obj.length,
                    index  = 0;

                while (index < limit) {
                    if (index > 0)
                        result+= ", ";
                    result+= dump(obj[index], stack, level + 1);
                    index++;
                }

                return "[" + result + "]";

            case 'object':
                if (push(obj, stack, level))
                    return "*recursion*";

                var result = "",
                    index  = 0;

                for (var key in obj) {
                    if (index > 0)
                        result+= ", ";
                    result+= key + ": " + dump(obj[key], stack, level + 1);
                    index++;
                }

                return "{" + result + "}";

            case 'function':
                return "function(){}";

            default:
                return String(obj);
        }
    }


    /**
     * Экспорт функций
     */
    ju.dump = function(obj) {
        return dump(obj, [], 0);
    };


    /**
     * Если необходимо определить консоль
     */
    if (window.console)
        return;


    var $console = $('<div />').css({
        position:   "fixed",
        left:       "0px",
        right:      "0px",
        bottom:     "0px",
        margin:     "0px",
        padding:    "6px 8px 6px 8px",
        border:     "0px none",
        borderTop:  "1px #666666 solid",
        overflow:   "auto",
        wordWrap:   "break-word",
        whiteSpace: "pre-wrap",
        background: "#f9f9f9",
        fontFamily: "Courier New",
        fontSize:   "14px",
        lineHeight: "normal",
        color:      "#000000",
        cursor:     "default",
        height:     "180px",
        zIndex:     "2000000"
    }).hide();

    var c = {};

    var onload = function() {

        $console.appendTo('body');

        $(document).keyup(function(e) {
            if (e.ctrlKey && e.shiftKey) {
                // Ctrl + Shift + C
                if (e.which == 67)
                    c.toggle();

                // Ctrl + Shift + X
                if (e.which == 88)
                    c.clear();

            }
        });

    };


    /**
     * Отобразить консоль
     */
    c.show = function() {
        $console.show();
    };

    /**
     * Скрыть консоль
     */
    c.hide = function() {
        $console.hide();
    };

    /**
     * Отобрахить / скрыть консоль
     */
    c.toggle = function() {
        $console.toggle();
    };

    /**
     * Очистить консоль
     */
    c.clear = function() {
        $console.empty();
    };


    /**
     * Добавить сообщение в консоль
     */
    var append = function(/* arguments */) {
        var length = arguments.length,
            result = [];

        for (var i = 0; i < length; i++)
            result.push(ju.dump(arguments[i]));

        $console.append(ju.escape(result.join(' ')) + '<br />');
    };

    c.log   = append;
    c.info  = append;
    c.warn  = append;
    c.error = append;
    c.debug = append;


    /**
     * Экспорт консоли
     */
    window.console = c;

    /**
     * Подписка на событие загрузки
     */
    $(onload);

})(window, window.ju, window.jQuery);