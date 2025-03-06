from rest_framework.permissions import BasePermission

class IsAdminOrLecturer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.roles.filter(name__in=["Admin", "Lecturer"]).exists()