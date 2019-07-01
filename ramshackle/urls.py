"""
Studio URL configuration for Ramshackle.
"""
from __future__ import absolute_import, division, print_function, unicode_literals

from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'^ramshackle/', include([
        url(r'.*', views.RamshackleSpaView.as_view()),
    ])),
]
