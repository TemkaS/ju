/**
 * ju framework © darkslave.net
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


    Loader.__transport = {};

    Loader.setTransport = function(type, transport) {
        if (!ju.isFunction(transport))
            throw new Error('Transport is not a function');
        Loader.__transport[type] = transport;
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
                    var resp = {};
                    resp.aborted = abort;
                    resp.request = reqt;

                    delete loading[id];
                    reqt.onreadystatechange = null;
                    done = true;

                    if (abort) {
                        if (reqt.readyState !== 4)
                            reqt.abort();
                    } else {
                        resp.statusCode = reqt.status !== 1223 ? reqt.status : 204;
                        resp.statusText = reqt.statusText;
                        resp.content    = reqt.responseText;
                    }

                    if (!silent) {
                        complete(resp);
                    }
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
                        var resp = {};
                        resp.aborted = abort;
                        resp.element = node;

                        node.onload  = node.onreadystatechange = null;
                        node.onerror = null;
                        done = true;

                        complete(resp);
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
                    var resp = {};
                    resp.aborted = undefined;
                    resp.element = node;
                    complete(resp);
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
        Loader.setTransport('dom:js', function(path, complete) {
            var options = {
                    tagName: "script",
                    attributes: {
                        src:   path,
                        type:  "text/javascript"
                    },
                    fireOnload: true,
                    timeout:    Loader.defaultTimeout
                };
            return Transport(options, complete);
        });

        /**
         * Укороченная версия для загрузки css-файлов
         */
        Loader.setTransport('dom:css', function(path, complete) {
            var options = {
                    tagName: "link",
                    attributes: {
                        href:  path,
                        type:  "text/css",
                        rel:   "stylesheet"
                    },
                    fireOnload: false,
                    timeout:    Loader.defaultTimeout
                };
            return Transport(options, complete);
        });

        /**
         * Укороченная версия для загрузки картинок
         */
        Loader.setTransport('dom:img', function(path, complete) {
            var options = {
                    tagName: "img",
                    attributes: {
                        src:   path
                    },
                    fireOnload: true,
                    timeout:    Loader.defaultTimeout
                };
            return Transport(options, complete);
        });

    })();





    /**
     * Экспорт классов
     */
    ju.Loader = Loader;

})(window, window.ju, window.document);