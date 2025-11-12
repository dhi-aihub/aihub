from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AssignRoleView,
    ChangePasswordView,
    CreateAdminView,
    CustomTokenObtainPairView,
    DeactivateUserView,
    GetUserRolesView,
    LogoutView,
    ReactivateUserView,
    RegisterUserView,
    RevokeRoleView,
    UserDetailView,
    UserListView,
    UserIdsFromEmailsView,
    UserDetailsFromIdsView,
    health_check,
)

urlpatterns = [
    path("", health_check, name="health-check"),
    path("create-admin/", CreateAdminView.as_view(), name="create-admin"),
    path("auth/register/", RegisterUserView.as_view(), name="register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("auth/refresh-token/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("users/me/", UserDetailView.as_view(), name="user_detail_self"),
    path("users/", UserListView.as_view(), name="user_list"),
    path("users/<int:user_id>/", UserDetailView.as_view(), name="user_detail_specific"),
    path(
        "users/<int:user_id>/deactivate/",
        DeactivateUserView.as_view(),
        name="deactivate-user",
    ),
    path(
        "users/<int:user_id>/reactivate/",
        ReactivateUserView.as_view(),
        name="reactivate-user",
    ),
    path(
        "users/<int:user_id>/assign-role/", AssignRoleView.as_view(), name="assign-role"
    ),
    path(
        "users/<int:user_id>/revoke-role/", RevokeRoleView.as_view(), name="revoke-role"
    ),
    path(
        "users/<int:user_id>/roles/", GetUserRolesView.as_view(), name="get-user-roles"
    ),
    path(
        "users/ids-from-emails/",
        UserIdsFromEmailsView.as_view(),
        name="user_ids_from_emails",
    ),
    path(
        "users/details-from-ids/",
        UserDetailsFromIdsView.as_view(),
        name="user_details_from_ids",
    ),
]
