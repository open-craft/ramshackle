"""
Views for Ramshackle.
"""
from __future__ import absolute_import, division, print_function, unicode_literals


from django.template.loader import render_to_string
import pkg_resources
from web_fragments.fragment import Fragment

from openedx.core.djangoapps.plugin_api.views import EdxFragmentView


class RamshackleSpaView(EdxFragmentView):
    """
    Render the Ramshackle single page app.
    """
    def create_base_standalone_context(self, request, fragment, **kwargs):
        """
        Override context for the base template that we use
        """
        return {
            'uses_pattern_library': False,
            'uses_bootstrap': True,
            # 'disable_accordion': True,
            # 'allow_iframing': True,
            # 'disable_header': True,
            # 'disable_footer': True,
            # 'disable_window_wrap': True,
        }

    def render_to_fragment(self, request):
        """
        Render the Ramshackle single page app.
        """
        context = {
        }
        html = render_to_string('ramshackle.html', context)
        fragment = Fragment(html)
        js_str = pkg_resources.resource_string('ramshackle', 'js-dist/ramshackle.js').decode('utf-8')
        fragment.add_javascript(js_str)
        return fragment
