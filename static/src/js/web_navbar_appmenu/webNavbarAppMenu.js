/** @odoo-module **/

import { NavBar } from '@web/webclient/navbar/navbar';
import { patch } from "@web/core/utils/patch";

import {
    Component,
    onWillDestroy,
    useExternalListener,
    onMounted,
    useRef,
    onWillUnmount,
} from "@odoo/owl";

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.openElement = useRef("openSidebar");
        this.closeElement = useRef("closeSidebar");
        this.topHeading = useRef("top_heading");
        this.mainNavBar = useRef("o_main_navbar");
        this.sidebarLinks = useRef("sidebarLinks");
        const sidebarLinkHandler = this.handleSidebarLinkClick.bind(this);
        const openSidebarHandler = this.openSidebar.bind(this);
        const closeSidebarHandler = this.closeSidebar.bind(this);
        onMounted(() => {
            const openSidebarElement = this.openElement.el
            const closeSidebarElement = this.closeElement.el
            const sidebarLinkElements = this.sidebarLinks.el.children;
            if (sidebarLinkElements) {
                Array.from(sidebarLinkElements).forEach(link => {
                    link.addEventListener('click', sidebarLinkHandler);
                });
            }
            if (openSidebarElement) {
                openSidebarElement.addEventListener('click', openSidebarHandler);
            }
            if (closeSidebarElement) {
                closeSidebarElement.addEventListener('click', closeSidebarHandler);
            }
        });

        onWillUnmount(() => {
            const openSidebarElement = this.openElement.el
            const closeSidebarElement = this.closeElement.el
            const sidebarLinkElements = this.sidebarLinks.el.children;
            if (openSidebarElement) {
                openSidebarElement.removeEventListener('click', openSidebarHandler);
            }
            if (closeSidebarElement) {
                closeSidebarElement.removeEventListener('click', closeSidebarHandler);
            }
            if (sidebarLinkElements) {
                Array.from(sidebarLinkElements).forEach(link => {
                    link.removeEventListener('click', sidebarLinkHandler);
                });
            }
        });
    },

    openSidebar() {
        this.root.el.nextElementSibling.style.marginLeft = '200px';
        this.root.el.nextElementSibling.style.transition = 'all .1s linear';
        const openSidebarElement = this.openElement.el
        const closeSidebarElement = this.closeElement.el
        if (openSidebarElement) openSidebarElement.style.display = 'none';
        if (closeSidebarElement) closeSidebarElement.style.display = 'block';
        // Show the actual sidebar panel element rather than manipulating
        // the component's lastChild. This avoids hiding other header elements
        // that may live near the component root.
        const sidebarPanel = document.getElementById('sidebar_panel');
        if (sidebarPanel && sidebarPanel.nodeType === Node.ELEMENT_NODE) {
            sidebarPanel.style.display = 'block';
        }
        if (this.topHeading.el && this.topHeading.el.nodeType === Node.ELEMENT_NODE) {
          this.topHeading.el.style.marginLeft = '200px';
          this.topHeading.el.style.transition = 'all .1s linear';
          this.topHeading.el.style.width = 'auto';
        }
                // Ensure critical header icons stay visible when sidebar opens.
                this.ensureHeaderIconsVisible();
    },

    closeSidebar() {
        console.log('Sidebar closed', this.topHeading);
        this.root.el.nextElementSibling.style.marginLeft = '0px';
        this.root.el.nextElementSibling.style.transition = 'all .1s linear';
        const openSidebarElement = this.openElement.el
        const closeSidebarElement = this.closeElement.el
        if (openSidebarElement) openSidebarElement.style.display = 'block';
        if (closeSidebarElement) closeSidebarElement.style.display = 'none';
        // Ensure the actual sidebar panel is hidden when closing so the
        // sidebar fully disappears from view and does not remain visible
        // after clicking an app or the close control.
        const sidebarPanel = document.getElementById('sidebar_panel');
        if (sidebarPanel && sidebarPanel.nodeType === Node.ELEMENT_NODE) {
            sidebarPanel.style.display = 'none';
        }
        // Keep lastChild visible so header icons (e.g. add/plus) remain accessible
        // Previously the theme hid `this.root.el.lastChild` here which caused
        // some header icons to disappear when the sidebar was closed.
                if (this.topHeading.el && this.topHeading.el.nodeType === Node.ELEMENT_NODE) {
                    this.topHeading.el.style.marginLeft = '0px';
                    // Remove any forced width so the control panel and its icons
                    // can size naturally and remain visible (avoid 100% which may
                    // push the control panel off-screen on some layouts).
                    this.topHeading.el.style.width = '';
                }
                // Also make sure header icons remain visible after closing.
                this.ensureHeaderIconsVisible();
    },

    handleSidebarLinkClick(event) {
        const closeSidebarElement = this.closeElement.el
        if (closeSidebarElement) closeSidebarElement.style.display = 'none';
        if (this.topHeading.el && this.topHeading.el.nodeType === Node.ELEMENT_NODE) {
          this.topHeading.el.style.marginLeft = '0px';
        }
                if (this.topHeading.el && this.topHeading.el.nodeType === Node.ELEMENT_NODE) {
                    this.topHeading.el.style.marginLeft = '0px';
                    this.topHeading.el.style.width = '';
                }
        const li = event.currentTarget;
        const a = li.firstElementChild;
        const id = a.getAttribute('data-id');
        // Preserve existing header classes: store previous app-specific class
        // in a data attribute and toggle a single prefixed class instead of
        // overwriting the entire `className`, which caused header icons to
        // disappear when the original implementation removed needed classes.
        const header = document.querySelector('header');
        if (header && id) {
            const prevAppClass = header.dataset.appClass;
            if (prevAppClass) {
                header.classList.remove(prevAppClass);
            }
            const newAppClass = `app-active-${id}`;
            header.classList.add(newAppClass);
            header.dataset.appClass = newAppClass;
            header.dataset.appId = id;
        }
        Array.from(this.sidebarLinks.el.children).forEach(li => {
            li.firstElementChild.classList.remove('active');
        });
        a.classList.add('active');
        // Also explicitly hide the sidebar panel before closing the
        // component-level adjustments to ensure it becomes invisible
        // immediately when an app is clicked.
        const sidebarPanel = document.getElementById('sidebar_panel');
        if (sidebarPanel && sidebarPanel.nodeType === Node.ELEMENT_NODE) {
            sidebarPanel.style.display = 'none';
        }
        // Force icons visible for maximum resilience across themes.
        this.ensureHeaderIconsVisible();
        this.closeSidebar();
    },

    // Helper: force visibility of important header icons (hamburger, add/+) by
    // applying inline styles. This is a fallback when class-based or theme
    // manipulations hide them; inline styles take precedence over CSS rules.
    ensureHeaderIconsVisible() {
        try {
            const selectors = [
                '.o_control_panel .o_control_panel_main_buttons .o_list_button_add',
                '.o_control_panel .o_control_panel_main_buttons .o_list_button_add > .fa',
                '.o_control_panel .o_control_panel_main_buttons .o_list_button_add > .oi',
                '.o_control_panel .o_control_panel_main_buttons .o_list_button_add svg',
                '.o_control_panel .fa-bars',
                '.o_control_panel i.fa.fa-bars',
                '.o_control_panel .fa-plus',
                '.o_control_panel i.fa.fa-plus'
            ];
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    if (el && el.style) {
                        el.style.display = 'inline-flex';
                        el.style.visibility = 'visible';
                        el.style.opacity = '1';
                        el.style.pointerEvents = 'auto';
                        el.style.zIndex = '99999';
                    }
                });
            });
        } catch (e) {
            // fail silently to avoid breaking navbar if DOM differs
            console.warn('ensureHeaderIconsVisible failed', e);
        }
    }
});