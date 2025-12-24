odoo.define('dava_theme.fields.m2o_float', function (require) {
    "use strict";

    var core = require('web.core');
    var rpc = require('web.rpc');

    var $window = $(window);

    function positionFloating($floating, $input) {
        var rect = $input[0].getBoundingClientRect();
        var top = rect.bottom + window.scrollY;
        var left = rect.left + window.scrollX;
        
        // Calculate available space below and above
        var spaceBelow = window.innerHeight - rect.bottom;
        var spaceAbove = rect.top;
        var dropdownHeight = $floating.outerHeight() || 300; // estimated or actual height
        
        // If not enough space below, position above the input
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            top = rect.top + window.scrollY - dropdownHeight - 2; // 2px gap
            $floating.addClass('m2o-floating-above');
        } else {
            $floating.removeClass('m2o-floating-above');
        }
        
        $floating.css({
            position: 'absolute',
            top: top + 'px',
            left: left + 'px',
            width: rect.width + 'px',
            zIndex: 200000, // Extremely high z-index
            maxHeight: Math.max(spaceBelow, spaceAbove) - 20 + 'px', // Ensure it fits
            overflowY: 'auto'
        });
    }

    function floatDropdown($widget, $input, $dropdown) {
        // ensure only one copy
        $dropdown.addClass('m2o-floating').appendTo('body');
        
        // Force high z-index immediately
        $dropdown.css('z-index', '200000');
        
        positionFloating($dropdown, $input);

        // reposition on scroll/resize with debounce
        var repositionTimer;
        var onMove = function () { 
            clearTimeout(repositionTimer);
            repositionTimer = setTimeout(function() {
                positionFloating($dropdown, $input);
            }, 10);
        };
        $window.on('scroll.m2o resize.m2o', onMove);

        // close handler: when dropdown is removed or input blurs
        var cleanup = function () {
            $window.off('.m2o');
            $dropdown.removeClass('m2o-floating m2o-floating-above');
            clearTimeout(repositionTimer);
            // try to put it back to the original widget container if still present
            try {
                $dropdown.appendTo($widget);
            } catch (e) {}
        };

        // Observe dropdown removal
        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.removedNodes && m.removedNodes.forEach(function (n) {
                    if (n === $dropdown[0]) {
                        cleanup();
                        mo.disconnect();
                    }
                });
            });
        });
        mo.observe(document.body, {childList: true});

        // also cleanup when input loses focus (increased delay for better UX)
        $input.one('blur.m2o', function () {
            setTimeout(cleanup, 200);
            mo.disconnect();
        });
    }

    // Detect autocomplete/dropdown creation and float it for the focused many2one input
    // This works for BOTH regular form fields AND inline editable lists (one2many/many2many)
    $(document).on('focusin', '.o_field_many2one .o_input, .o_field_many2one input, .o_data_row .o_field_many2one input, .o_list_table .o_field_many2one input', function () {
        var $input = $(this);
        var $widget = $input.closest('.o_field_many2one');
        
        // For inline lists, also check if we're inside a table row
        var $row = $input.closest('tr.o_data_row, tr.o_selected_row');
        var isInList = $row.length > 0;
        
        var active = {
            input: $input, 
            widget: $widget, 
            row: $row,
            isInList: isInList,
            floated: []
        };

        // Expand selectors to catch more dropdown types
        var selectors = '.o_autocomplete, .dropdown-menu, .o_search_dropdown, .o_dropdown, ' +
                       '.o_searchview_autocomplete, .ui-autocomplete, .ui-menu, ' +
                       '.o_m2o_dropdown_option, .select2-dropdown, .o-autocomplete--dropdown-menu';

        function scanAndFloat() {
            var $found = $(selectors).filter(function () {
                // must be visible and not already floated
                return $(this).is(':visible') && !$(this).hasClass('m2o-floating');
            });
            if ($found.length) {
                console.log('m2o_float: found dropdown(s)', $found.length, 'inList:', active.isInList);
                $found.each(function () {
                    var $dd = $(this);
                    console.log('m2o_float: floating dropdown', $dd[0]);
                    // float the dropdown relative to the active input
                    try {
                        floatDropdown(active.widget, active.input, $dd);
                        active.floated.push($dd);
                    } catch (e) {
                        console.error('m2o_float error floating dropdown', e);
                    }
                });
                return true;
            }
            return false;
        }

        // initial scan (some dropdowns appear immediately)
        setTimeout(function() {
            if (scanAndFloat()) {
                return;
            }
        }, 50); // Small delay to ensure dropdown is rendered

        // otherwise, observe the document for added dropdown nodes while this input is focused
        var mo = new MutationObserver(function (mutations) {
            if (scanAndFloat()) {
                mo.disconnect();
            }
        });
        mo.observe(document.body, {childList: true, subtree: true});

        // also scan periodically while focused (handles delayed rendering)
        var scanInterval = setInterval(function () { 
            if (scanAndFloat()) { 
                clearInterval(scanInterval); 
            } 
        }, 100); // Reduced interval for faster detection

        // also trigger scan on click (some dropdowns open on click)
        active.input.on('click.m2ofloat', function () { 
            setTimeout(scanAndFloat, 50); 
        });

        // also scan on keyup (for search-as-you-type dropdowns)
        active.input.on('keyup.m2ofloat', function(e) {
            // Only scan on actual typing, not on navigation keys
            if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                setTimeout(scanAndFloat, 100);
            }
        });

        // cleanup on blur: remove floating class and put dropdown back
        $input.one('blur.m2ofloat', function () {
            setTimeout(function () {
                clearInterval(scanInterval);
                active.input.off('.m2ofloat');
                active.floated.forEach(function ($dd) {
                    try {
                        $dd.removeClass('m2o-floating m2o-floating-above');
                        // if dropdown was originally inside widget, try to append back
                        if ($widget && $widget.length) {
                            $dd.appendTo($widget);
                        }
                    } catch (e) {}
                });
                active.floated = [];
                mo.disconnect();
                $window.off('.m2o');
            }, 200);
        });
    });

    // Additional safety: ensure any dropdown that appears gets the highest z-index
    $(document).on('DOMNodeInserted', function(e) {
        var $target = $(e.target);
        if ($target.hasClass('dropdown-menu') || 
            $target.hasClass('o_autocomplete') ||
            $target.hasClass('ui-autocomplete') ||
            $target.hasClass('o-autocomplete--dropdown-menu')) {
            if ($target.css('position') === 'absolute' || $target.css('position') === 'fixed') {
                var currentZ = parseInt($target.css('z-index')) || 0;
                if (currentZ < 200000) {
                    $target.css('z-index', '200000');
                }
            }
        }
    });

    // Special handling for one2many/many2many list views
    // Ensure table cells don't clip dropdowns
    $(document).on('focusin', '.o_list_table .o_data_row input, .o_list_table .o_data_row select', function() {
        var $cell = $(this).closest('td');
        var $row = $(this).closest('tr');
        var $table = $(this).closest('.o_list_table');
        
        // Temporarily remove overflow constraints
        $cell.css('overflow', 'visible');
        $row.css('overflow', 'visible');
        $table.css('overflow', 'visible');
        
        // Reset on blur
        $(this).one('blur', function() {
            setTimeout(function() {
                $cell.css('overflow', '');
                $row.css('overflow', '');
                $table.css('overflow', '');
            }, 300);
        });
    });

    return {};
});