"""
URL configuration for user_service project.
"""

from django.urls import path, include

urlpatterns = [
  path('', include('users_service.urls')),
]
