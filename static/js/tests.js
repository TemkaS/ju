
function ignoreSpaces(line, limit) {
    var n = Math.min(limit, line.length),
        i = 0;

    while (i < n && line.charCodeAt(i) <= 32)
        i++;
    
    return i > 0 ? line.substring(i) : line;
}


function functionCode(func) {
    var code = Function.prototype.toString.call(func)
               .replace(/^[^{]*[{](?:\s*[\r\n])*|\s*[}].*?$/g, "")
               .split(/\r?\n/g);

    if (code.length == 0)
        return "";
    
    var first = code[0];
    code[0] = ignoreSpaces(first, first.length);

    var limit = first.length - code[0].length;
    if (limit > 0) {
        var index = code.length;
        while(--index > 0) {
            code[index] = ignoreSpaces(code[index], limit);
        }
    }
    
    return code.join("\r\n");
}


function initTestCases(container, caselist) {
    $.each(caselist, function(i, item) {
        var $item = $('<div class="item" />');

        $('<a class="title" href="javascript:;" />')
            .html(item.title)
            .click(item.test)
            .appendTo($item);
        
        $('<div class="about" />')
            .html(item.about)
            .appendTo($item);

        var $code = $('<pre class="code" />');
        
        $('<a class="toggle" href="javascript:;" />')
            .html('показать исходный код »')
            .click(function() {
                $code.toggle();
            })
            .appendTo($item);

        $code.html(functionCode(item.test))
            .hide()
            .appendTo($item);

        hljs.highlightBlock($code[0]);
        
        $item.appendTo(container);
    });
}

