/**
 * ju framework © darkslave.net 
 * https://github.com/darkslave86/ju
 */
(function(window, ju, $) {
    "use strict";

    if (ju == null || $ == null)
        throw new Error('Dependencies are not resolved');


    var FIELD_SELECT = 4,
        FIELD_CHECK  = 3,
        FIELD_VALUE  = 2,
        FIELD_HTML   = 1,
        FIELD_NONE   = 0;


    /**
     * Примитив модели, связанный с представлением
     */
    function Field(selector, context) {
        Field.__super__.call(this);

        var that = this;

        this.__selector = selector;
        this.__context  = context;

        this.__handler  = function(e) {
            that.__handleEvents(e);
        };

        this.__ondrop   = function() {
            that.updateData('drop');
        };

        this.updateField();
    }

    ju.mixin(ju.Observable, Field);


    /**
     * целевой элемент
     */
    Field.prototype.target = function() {
        return this.__target;
    };


    /**
     *  обновление ссылки на представление
     */
    Field.prototype.updateField = function() {
        if (!ju.isString(this.__selector) && this.__target != null)
            return this.__updateOptions();

        var target = this.__context != null
                   ? $(this.__selector, this.__context)
                   : $(this.__selector);

        if (!target.length)
            throw new Error('Target element is not found');

        var type = getFieldType(target);

        if (type === FIELD_NONE)
            throw new Error('Target element is not supported');

        if (type !== FIELD_CHECK)
            target = target.eq(0);

        if (this.__target != null) {
            var changed = this.__type !== type,
                index = target.length;

            while (!changed && --index >= 0)
                if (this.__target[index] !== target[index])
                    changed = true;

            if (!changed)
                return this.__updateOptions();

            this.__target.unbind('change keyup drop', this.__handler);
        }

        this.__multiple = false;
        this.__target = target;
        this.__type   = type;

        switch (type) {
            case FIELD_SELECT:
                this.__target.bind('change', this.__handler);
                this.__options  = this.__target.children('option');
                this.__multiple = !!this.__target[0].multiple;
            break;

            case FIELD_CHECK:
                this.__target.bind('change', this.__handler);
                this.__multiple = this.__target.length > 1;
            break;

            case FIELD_VALUE:
                this.__target.bind('change keyup drop', this.__handler);
            break;
        }

        this.__updateView0 = this.__updateView[type] || ju.noop;
        this.__updateData0 = this.__updateData[type] || ju.noop;

        this.__updateData0();
        return this;
    };


    Field.prototype.__updateOptions = function() {
        if (this.__type === FIELD_SELECT) {
            this.__options  = this.__target.children('option');
            this.__multiple = !!this.__target[0].multiple;
        }

        this.__updateData0();
        return this;
    };


    Field.prototype.__handleEvents = function(e) {
        switch (e.type) {
            case 'change':
                this.updateData(e.type);
                return;

            case 'keyup':
                if (ju.Events.isChangingKey(e))
                    this.updateData(e.type);
                return;

            case 'drop':
                window.setTimeout(this.__ondrop);
                return;
        }
    };


    Field.prototype.set = function(value) {
        if (!checkValue(value))
            throw new Error('Value `' + value + '` is not valid');

        this.__value = stringValue(value, this.__multiple);
        this.fire('set');

        this.updateView();
        return this;
    };


    Field.prototype.get = function() {
        return this.__value;
    };


    /**
     * проверка на установленное значение
     */
    Field.prototype.isset = function(value) {
        if (!this.__multiple)
            return this.__value === value;

        var index = this.__value.length;

        while (--index >= 0)
            if (this.__value[index] === value)
                return true;

        return false;
    };


    /**
     *  обновление представления по модели
     */
    Field.prototype.updateView = function() {
        this.__updateView0();
        this.fire('update');
        return this;
    };


    /**
     *  обновление данных модели по представлению
     */
    Field.prototype.updateData = function(type) {
        this.__updateData0();
        this.fire('change', type);
        return this;
    };


    Field.prototype.__updateViewAttr = function(options, attr) {
        var that  = this,
            first = true;

        options.each(function() {
            if ((that.__multiple || first) && that.isset(this.value)) {
                this[attr] = true;
                first = false;
            } else {
                this[attr] = false;
            }
        });

    };


    Field.prototype.__updateDataAttr = function(options, attr) {
        var that  = this,
            first = true,
            value = [];

        options.each(function() {
            if ((that.__multiple || first) && this[attr]) {
                value.push(this.value);
                first = false;
            }
        });

        return that.__multiple ? value : value[0] || "";
    };



    Field.prototype.__updateView = {};

    Field.prototype.__updateView[FIELD_SELECT] = function() {
        this.__updateViewAttr(this.__options, 'selected');
    };

    Field.prototype.__updateView[FIELD_CHECK] = function() {
        this.__updateViewAttr(this.__target, 'checked');
    };

    Field.prototype.__updateView[FIELD_VALUE] = function() {
        this.__target.val(this.__value);
    };

    Field.prototype.__updateView[FIELD_HTML] = function() {
        this.__target.html(this.__value);
    };



    Field.prototype.__updateData = {};

    Field.prototype.__updateData[FIELD_SELECT] = function() {
        this.__value = this.__updateDataAttr(this.__options, 'selected');
    };

    Field.prototype.__updateData[FIELD_CHECK] = function() {
        this.__value = this.__updateDataAttr(this.__target, 'checked');
    };

    Field.prototype.__updateData[FIELD_VALUE] = function() {
        this.__value = this.__target.val();
    };



    function checkValue(value) {
        if (!ju.isArray(value))
            return __checkValue(value);

        var index = value.length;

        while (--index >= 0)
            if (!__checkValue(value[index]))
                return false;

        return true;
    }


    function __checkValue(value) {
        return ju.isString(value) || ju.isNumber(value);
    }


    function stringValue(value, multiple) {
        if (!multiple) {
            if (ju.isArray(value))
                value = value[0];

            return __stringValue(value);
        }

        if (value == null)
            return [];

        if (!ju.isArray(value))
            value = [ value ];

        var index = value.length;

        while (--index >= 0)
            value[index] = __stringValue(value[index]);

        return value;
    }


    function __stringValue(value) {
        return value != null ? String(value) : "";
    }


    function getFieldType($target) {
        var tagName = $target[0].tagName;

        if (tagName === 'TEXTAREA')
            return FIELD_VALUE;

        if (tagName === 'SELECT')
            return FIELD_SELECT;

        if (tagName === 'INPUT') {
            switch($target[0].type) {
                case 'button':
                case 'image':
                case 'reset':
                case 'submit':
                    return FIELD_NONE;

                case 'checkbox':
                case 'radio':
                    return FIELD_CHECK;

                default:
                    return FIELD_VALUE;
            }
        }

        return FIELD_HTML;
    }




    /**
     * Модель. связанная с представлением
     */
    function Model(context) {
        this.__context = $(context);

        if (this.__context.length == 0)
            throw new Error('Target context is not found');

        if (this.__context.length >= 2)
            throw new Error('Target context is ambiguous');

        Model.__super__.call(this);

        this.updateModel();
    }

    ju.mixin(ju.Map, Model);


    /**
     * инициализация поля
     */
    Model.prototype.init = function(name, value, replace, target) {
        if (!replace && this.isset(name))
            throw new Error('Field `' + name + '` already exists');

        var field = new Field(target || '[name="' + name + '"]', this.__context);

        if (value != null)
            field.set(value);

        Model.__super__.prototype.set.call(this, name, field);
        return this;
    };


    /**
     * установка поля модели
     */
    Model.prototype.set = function(index, value) {
        if (!(value instanceof Field))
            throw new Error('Value is not instance of Field');

        Model.__super__.prototype.set.call(this, index, value);
        return this;
    };


    /**
     * обновление модели, реинициализация всех полей
     */
    Model.prototype.updateModel = function() {
        var affect = {};

        this.__context.find('[name]').each(function() {
            affect[this.name] = true;
        });

        var errors = [];

        for (var name in affect) try {
            this.init(name);
        } catch (e) {
            errors.push(e.message);
        }

        if (errors.length > 0)
            throw new Error('UpdateModel error:\n\t' + errors.join('\n\t'));

        return this;
    };


    Model.prototype.context = function() {
        return this.__context;
    };


    Model.prototype.find = function(selector) {
        return this.__context.find(selector);
    };


    Model.prototype.setState = function(state) {
        if (!ju.isObject(state))
            throw new Error('State is not an object');

        for (var index in this.__value) {
            var field = this.__value[index],
                value = state[index];

            if (value != null)
                field.set(value);
        }

        return this;
    };


    Model.prototype.getState = function() {
        var state = {};

        for (var index in this.__value) {
            var field = this.__value[index];
            state[index] = field.get();
        }

        return state;
    };



    /**
     *  создание модели по текстовому шаблону
     */
    var reSelector = /^\s*(?:[>+~]\s*)?(?:[#\.:]?[\w\-]+|[*])/;

    Model.createFromTpl = function(template) {
        var $template = null;

        if (ju.isString(template)) {
            if (reSelector.test(template))
                $template = $(template);
        } else
        if (ju.isObject(template)) {
            $template = $(template);
        } else {
            throw new Error('Template is not valid');
        }

        if ($template != null) {
            if ($template.length == 0)
                throw new Error('Template element is not found');

            if ($template.length >= 2)
                throw new Error('Template element is ambiguous');

            template = $template[0].outerHTML;
        }

        $template = $(template);
        $template.each(sanitizeTpl);
        $template.find('*').each(sanitizeTpl);

        return new Model($template);
    };


    function sanitizeTpl() {
        this.removeAttribute('id');
    }



    /**
     * Экспорт классов
     */
    ju.Field = Field;
    ju.Model = Model;

})(window, window.ju, window.jQuery);