// Fallback injector for Portal Back Button
(function () {
    function shouldRun() {
        var path = window.location.pathname || '';
        return path.startsWith('/my/') && path !== '/my' && path !== '/my/';
    }

    function createWrapper() {
        var wrapper = document.createElement('div');
        wrapper.className = 'o_portal_back_container mb-3';
        wrapper.innerHTML = '<div class="container">' +
            '<a href="/my" class="btn btn-secondary o_portal_back_btn">' +
            '<i class="fa fa-arrow-left me-2"></i>Back to My Account' +
            '</a></div>';
        return wrapper;
    }

    function injectOnce() {
        try {
            if (!shouldRun()) { return false; }
            if (document.querySelector('.o_portal_back_btn')) { return true; }
            var selectors = ['main', '.o_portal_wrap', '.o_portal', '.o_portal_container', '.o_container', '.container', '.o_content'];
            var ref = null;
            for (var i = 0; i < selectors.length; i++) {
                var el = document.querySelector(selectors[i]);
                if (el) { ref = el; break; }
            }
            var wrapper = createWrapper();
            if (ref && ref.parentNode) {
                ref.parentNode.insertBefore(wrapper, ref);
            } else if (document.body) {
                document.body.insertBefore(wrapper, document.body.firstChild);
            }
            return true;
        } catch (e) {
            console.error('portal_back_button injector error', e);
            return false;
        }
    }

    // Create observer
    var observer = new MutationObserver(function (mutations) {
        if (injectOnce()) {
            try { observer.disconnect(); } catch (e) { /* ignore */ }
        }
    });

    function tryStartObserver() {
        try {
            if (document && document.body && typeof observer.observe === 'function') {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        } catch (e) {
            console.warn('portal_back_button: could not start observer', e);
        }
    }

    // Run after DOM ready to ensure document.body exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            injectOnce();
            tryStartObserver();
        });
    } else {
        injectOnce();
        tryStartObserver();
    }

    // Also handle history navigation where MutationObserver might not fire immediately
    window.addEventListener('popstate', function () { setTimeout(injectOnce, 50); });
    // patch for pushState events: dispatch a custom event when pushState is called
    (function(history){
        var push = history.pushState;
        history.pushState = function(){
            var ret = push.apply(this, arguments);
            var ev = new Event('pushstate');
            window.dispatchEvent(ev);
            return ret;
        };
    })(window.history);
    window.addEventListener('pushstate', function () { setTimeout(injectOnce, 50); });
})();
