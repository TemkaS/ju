/**
 * ju framework © darkslave.net 
 * https://github.com/darkslave86/ju
 */
(function(window, ju, document) {
    "use strict";

    if (ju == null || document == null)
        throw new Error('Dependencies are not resolved');

    
    

    var Loader = {};

    /**
     * Таймаут по умолчанию
     */
    Loader.defaultTimeout = 30000;


    var transports = {};
    

    Loader.setTransport = function(type, transport) {
        if (!ju.isFunction(transport))
            throw new Error('Transport is not a function');
        transports[type] = transport;
    };

    
    Loader.getTransport = function(type) {
        return transports[type];
    };
    


    /**
     * XmlHttpRequest транспорт
     */
    (function() {
        var createXHR;

        if (window.XMLHttpRequest) {
            createXHR = function() {
                return new window.XMLHttpRequest();
            };
        } else
        if (window.ActiveXObject) {
            createXHR = function() {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            };
        } else {
            createXHR = function() {
                throw new Error('XMLHttpRequest is not supported');
            };
        }


        var loading = {},
            counter = 0;


        /**
         *  Получение данных через XmlHttpRequest
         */
        function Transport(options, complete) {
            var reqt = createXHR(),
                done = false,
                id = counter++;

            var success = function(_, abort, silent) {
                if (!done && (abort || reqt.readyState === 4)) {
                    delete loading[id];
                    reqt.onreadystatechange = null;
                    done = true;

                    if (abort && reqt.readyState !== 4)
                        reqt.abort();

                    if (silent)
                        return;
                    
                    complete(reqt, abort);
                }
            };

            var failure = function() {
                success(null, true);
            };

            reqt.onreadystatechange = loading[id] = success;

            reqt.open(options.type, options.url, true, options.username, options.password);

            if (options.headers) {
                for (var i in options.headers) {
                    reqt.setRequestHeader(i, options.headers[i]);
                }
            }

            if (options.mimeType && reqt.overrideMimeType) {
                reqt.overrideMimeType(options.mimeType);
            }

            reqt.send(options.data);

            if (reqt.readyState === 4) {
                window.setTimeout(success);
                return;
            }

            if (options.timeout > 0) {
                window.setTimeout(failure, options.timeout);
            }

        }


        /**
         * По закрытии окна закрываем все соединения
         */
        ju.Events.attach(window, 'unload', function() {
            for (var id in loading) {
                loading[id](null, true, true);
            }
        });


        /**
         * Экспорт транспорта
         */
        Loader.setTransport('xhr', Transport);

    })();



    /**
     * DOM транспорт
     */
    (function() {
        var head = document.getElementsByTagName('head')[0];

        /**
         * Проверка состояния загрузки
         */
        function isReady(state) {
            return !state || state === 'loaded' || state === 'complete' || state === 'uninitialized';
        }


        /**
         *  Загрузка ресурсов через создание DOM-элементов
         */
        function Transport(options, complete) {
            var node = document.createElement(options.tagName),
                done = false;

            if (options.fireOnload) {
                var success = function(_, abort) {
                    if (!done && (abort || isReady(node.readyState))) {
                        node.onload  = node.onreadystatechange = null;
                        node.onerror = null;
                        done = true;

                        complete(node, abort);
                    }
                };

                var failure = function() {
                    success(null, true);
                };

                node.onload  = node.onreadystatechange = success;
                node.onerror = failure;

                if (options.timeout > 0) {
                    window.setTimeout(failure, options.timeout);
                }

            } else {
                window.setTimeout(function() {
                    complete(node);
                });
            }

            for (var name in options.attributes)
                node.setAttribute(name, options.attributes[name]);

            node.async = true;

            head.appendChild(node);
        }


        /**
         * Экспорт транспорта
         */
        Loader.setTransport('dom', Transport);

        /**
         * Укороченная версия для загрузки js-файлов
         */
        Loader.setTransport('dom:js', function(origin, complete) {
            var options = {
                    tagName: "script",
                    attributes: {
                        src:    origin.url,
                        type:   "text/javascript",
                        charset: "utf-8"
                    },
                    fireOnload: true,
                    timeout:    origin.timeout || Loader.defaultTimeout
                };
            return Transport(options, complete);
        });

        /**
         * Укороченная версия для загрузки css-файлов
         */
        Loader.setTransport('dom:css', function(origin, complete) {
            var options = {
                    tagName: "link",
                    attributes: {
                        href:   origin.url,
                        type:   "text/css",
                        rel:    "stylesheet"
                    },
                    fireOnload: false,
                    timeout:    origin.timeout || Loader.defaultTimeout
                };
            return Transport(options, complete);
        });

        /**
         * Укороченная версия для загрузки картинок
         */
        Loader.setTransport('dom:img', function(origin, complete) {
            var options = {
                    tagName: "img",
                    attributes: {
                        src:    origin.url
                    },
                    fireOnload: true,
                    timeout:    origin.timeout || Loader.defaultTimeout
                };
            return Transport(options, complete);
        });

    })();


    
    
    
    
    function define(depend, callback) {
        if (!ju.isArray(depend))
            throw new Error('Dependencies is not an array');

        if (!ju.isFunction(callback))
            throw new Error('Callback is not a function');
        
        
        
        
    }



    /**
     * Экспорт классов
     */
    ju.define = define;

})(window, window.ju, window.document);