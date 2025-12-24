from odoo import http
from odoo.http import request
import werkzeug


class ThemeModuleControllers(http.Controller):
    @http.route('/', type='http', auth='public', website=True)
    def root_redirect(self, **kw):
        # Always redirect website root to the backend login page so theme login is shown
        return werkzeug.utils.redirect('/web/login')
