"""
Django settings for Ramshackle plugin
"""
from __future__ import absolute_import, division, print_function, unicode_literals
from path import Path

# Register settings: ###########################################################


def plugin_settings(settings):
    """
    Add our default settings to the edx-platform settings. Other settings files
    may override these values later, e.g. via envs/private.py.
    """
    # Register templates with mako:
    settings.MAKO_TEMPLATE_DIRS_BASE.append(
        Path(__file__).abspath().dirname() / 'templates'
    )
