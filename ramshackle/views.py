"""
Views for Ramshackle.
"""
from __future__ import absolute_import, division, print_function, unicode_literals

from edxmako.shortcuts import render_to_response


def render_ramshackle_spa(request):
    """
    Render the Ramshackle single page app.
    """
    return render_to_response('ramshackle.html', {})
