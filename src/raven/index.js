class Raven {

    static render(component) {
        $("#root").html(component)
    }

    static include(target, component) {
        $(target).html(component)
    }

    static loadStyle(style) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = style;
        link.media = 'all';
        head.appendChild(link);
    }

}

export default Raven