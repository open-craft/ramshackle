# -*- coding: utf-8 -*-
"""
Ramshackle Django application initialization.
"""

from __future__ import absolute_import, unicode_literals

from django.apps import AppConfig

from openedx.core.djangoapps.plugins.constants import PluginURLs, PluginSettings, ProjectType, SettingsType


class RamshackleAppConfig(AppConfig):
    """
    Configuration for the ramshackle Django plugin application.

    See: https://github.com/edx/edx-platform/blob/master/openedx/core/djangoapps/plugins/README.rst
    """

    name = 'ramshackle'
    plugin_app = {
        PluginURLs.CONFIG: {
            ProjectType.CMS: {
                # The namespace to provide to django's urls.include.
                PluginURLs.NAMESPACE: u'ramshackle',
            },
        },
        PluginSettings.CONFIG: {
            ProjectType.CMS: {
                SettingsType.COMMON: {PluginSettings.RELATIVE_PATH: 'settings'},
            },
        },
    }

    def ready(self):
        """
        Load signal handlers when the app is ready.
        """
        pass
