{
    "name": "Backend Theme",
    "version": "19.0.1.0.0",
    "category": "Themes/Backend",
    "summary": "Backend Theme is an attractive theme for backend",
    "description": """Minimalist and elegant theme for Odoo backend""",
    "author": "Dava Technology",
    "company": "Dava Technology",
    "maintainer": "Dava Technology",
    "website": "https://dava.ae",
    "depends": ["web", "web_tour", "website",
    "portal",],
    "data": [
        "views/layout_templates.xml",
        "views/base_menus.xml",
        "views/portal_back_button.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "dava_theme/static/src/xml/settings_templates.xml",
            "dava_theme/static/src/xml/top_bar_templates.xml",
            "dava_theme/static/src/scss/theme_accent.scss",
            "dava_theme/static/src/scss/navigation_bar.scss",
            "dava_theme/static/src/scss/datetimepicker.scss",
            "dava_theme/static/src/scss/theme.scss",
            "dava_theme/static/src/scss/custom_enhancements.scss",
            "dava_theme/static/src/scss/sidebar.scss",
            "dava_theme/static/src/js/fields/m2o_float.js",
            "dava_theme/static/src/js/fields/colors.js",
            'dava_theme/static/src/js/web_navbar_appmenu/webNavbarAppMenu.js',
            "dava_theme/static/src/scss/neo_theme_enhancements.scss",
        ],
        # Do not include backend-only JS modules in web.assets_web — they
        # import @web/* modules and cause missing-module errors when the
        # web bundle is loaded on website pages. Keep these files in
        # `web.assets_backend` only.
        "web.assets_frontend": [
            "dava_theme/static/src/scss/theme_accent.scss",
            "dava_theme/static/src/scss/login.scss",
            "dava_theme/static/src/js/portal_back_button.js",
        ],
    },
    "images": [
        "static/description/banner.jpg",
        "static/description/theme_screenshot.jpg",
    ],
    "license": "LGPL-3",
    "installable": True,
    "auto_install": False,
    "application": True,
    "pre_init_hook": "test_pre_init_hook",
    "post_init_hook": "test_post_init_hook",
}