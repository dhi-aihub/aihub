from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serialisers import AssignRoleSerializer, ChangePasswordSerializer, CreateAdminSerializer, CustomTokenObtainPairSerializer, LogoutSerializer, RoleSerializer, UserSerializer
from .permissions import IsAdminOrLecturer
from .models import Role
from rest_framework import generics, status, permissions

User = get_user_model()

class RegisterUserView(APIView):
    """
    API view for handling user registration.

    Allows any user to create a new account by providing a username, email, and password.

    Permissions:
        - Accessible to any user (no authentication required).
    """


    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handles user registration.

        Args:
            request (Request): The HTTP request object containing the user details.

        Returns:
            Response: A response containing user data or an error message.
            - HTTP 201: User registered successfully.
            - HTTP 400: Missing required fields or duplicate username/email.
        """

        data = request.data
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user account
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    API view for handling user authentication and obtaining JWT tokens.

    Eextends Django Rest Framework's `TokenObtainPairView` to use a 
    custom serializer that includes additional user information in the token payload.

    Attributes:
        serializer_class (Serializer): Uses `CustomTokenObtainPairSerializer` to generate JWT tokens.
    """

    serializer_class = CustomTokenObtainPairSerializer

class CreateAdminView(generics.CreateAPIView):
    """
    API view for creating admin accounts.

    Permissions:
        - Only authenticated superusers can access this endpoint.
    """

    serializer_class = CreateAdminSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):
        """
        Handles the creation of an admin account.

        Args:
            request (Request): The HTTP request containing the admin user details.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments.

        Returns:
            Response: A success message if the admin is created.
            - HTTP 201: Admin account created successfully.
            - HTTP 403: Permission denied if the requester is not a superuser.
        """

        if not request.user.is_superuser:
            return Response({"error": "Only superusers can create admins"}, status=403)

        return super().post(request, *args, **kwargs)

class LogoutView(APIView):
    """
    API view for handling user logout by blacklisting the refresh token.

    Permissions:
        - Only authenticated users can access this endpoint.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logs out a user by invalidating their refresh token.

        Args:
            request (Request): The HTTP request containing the refresh token.

        Returns:
            Response: A success message if the token is blacklisted successfully.
            - HTTP 200: Logout successful.
            - HTTP 400: Invalid or missing token.
        """

        serializer = LogoutSerializer(data=request.data)

        if serializer.is_valid():
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    """
    API view for retrieving, updating, and deleting user details.

    Permissions:
        - Authenticated users can retrieve and update their own details.
        - Admins can retrieve and delete any user's details.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        """
        Retrieves details for the current user or a specific user (if admin).

        Args:
            request (Request): The HTTP request object.
            user_id (int, optional): The ID of the user to retrieve. If None, retrieves the current user.

        Returns:
            Response: A serialized representation of the user.
            - HTTP 200: User details retrieved successfully.
            - HTTP 403: Permission denied for non-admins trying to access another user's details.
            - HTTP 404: User not found.
        """

        if user_id:  
            if request.user.is_staff: 
                try:
                    user = User.objects.get(id=user_id)

                except User.DoesNotExist:
                    return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            else:
                return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        else: 
            user = request.user

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """
        Updates user profile information.

        Args:
            request (Request): The HTTP request object containing the fields to be updated.

        Returns:
            Response: The updated user data.
            - HTTP 200: Profile updated successfully.
            - HTTP 400: Invalid input data.
        """

        user = request.user 
        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, user_id):
        """
        Deletes a user if the requester is an admin.

        Args:
            request (Request): The HTTP request object.
            user_id (int): The ID of the user to be deleted.

        Returns:
            Response: A success or error message.
            - HTTP 200: User deleted successfully.
            - HTTP 403: Permission denied if a non-admin tries to delete a user or an admin is targeted.
            - HTTP 404: User not found.
        """

        if request.user.is_staff:

            try:
                user = User.objects.get(id=user_id)

                if user.is_staff:
                    return Response({"error": "Cannot delete an admin."}, status=status.HTTP_403_FORBIDDEN)

                user.delete()
                return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        else:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

class UserListView(generics.ListAPIView):
    """
    API view for retrieving a list of all users.

    Permissions:
        - Only accessible by Admins or Lecturers.

    Attributes:
        queryset (QuerySet): Retrieves all users from the database.
        serializer_class (Serializer): Uses the UserSerializer to serialize user data.
        permission_classes (list): Ensures only Admins or Lecturers can access this endpoint.
    """
    permission_classes = [IsAdminOrLecturer]

    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserIdsFromEmailsView(APIView):
    """
    API view for retrieving user IDs from a list of emails.

    Permissions:
        - Only admin users can access this endpoint.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Returns a list of user IDs for the given list of emails.

        Args:
            request (Request): The HTTP request containing a list of emails.

        Returns:
            Response: A list of user IDs corresponding to the emails.
            - HTTP 200: Success.
            - HTTP 400: Invalid input.
        """
        emails = request.data.get("emails")
        if not isinstance(emails, list):
            return Response({"error": "A list of emails is required."}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(email__in=emails)
        email_to_id = {user.email: user.id for user in users}
        user_ids = [email_to_id.get(email) for email in emails]
        return Response({"userIds": user_ids}, status=status.HTTP_200_OK)
    
class UserDetailsFromIdsView(APIView):
    """
    API view for retrieving user details from a list of user IDs.

    Permissions:
        - Only admin users can access this endpoint.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Returns a list of user details for the given list of user IDs.

        Args:
            request (Request): The HTTP request containing a list of user IDs.

        Returns:
            Response: A list of user details corresponding to the user IDs.
            - HTTP 200: Success.
            - HTTP 400: Invalid input.
        """
        user_ids = request.data.get("userIds")
        if not isinstance(user_ids, list):
            return Response({"error": "A list of user IDs is required."}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(id__in=user_ids)
        serializer = UserSerializer(users, many=True)
        return Response({"users": serializer.data}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    """
    API view for allowing authenticated users to change their password.

    Permissions:
        - Only authenticated users can access this endpoint.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Handles password change requests.

        Args:
            request (Request): The HTTP request containing the old and new password.

        Returns:
            Response: A success message if the password is updated, or an error message if validation fails.
        """
 
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            user = request.user
            serializer.update(user, serializer.validated_data)
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeactivateUserView(APIView):
    """
    API view for deactivating a user account.

    Permissions:
        - Only admin users can access this endpoint.
    """

    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        """
        Handles user deactivation.

        Args:
            request (Request): The HTTP request.
            user_id (int): The ID of the user to be deactivated.

        Returns:
            Response: A success message if the user is deactivated,
                      an error message if the user is an admin, already deactivated, or not found.
        """

        try:
            user = User.objects.get(id=user_id)

            if user.is_staff:
                return Response({"error": "Cannot deactivate an admin."}, status=status.HTTP_403_FORBIDDEN)

            if not user.is_active:
                return Response({"message": "User is already deactivated."}, status=status.HTTP_400_BAD_REQUEST)

            user.is_active = False
            user.save()
            
            return Response({"message": "User deactivated successfully."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class ReactivateUserView(APIView):
    """
        API view for reactivating a deactivated user account.

    Permissions:
        - Only admin users can access this endpoint.
    """

    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        """
        Handles user reactivation.

        Args:
            request (Request): The HTTP request.
            user_id (int): The ID of the user to be reactivated.

        Returns:
            Response: A success message if the user is reactivated,
                      an error message if the user is already active or not found.
        """

        try:
            user = User.objects.get(id=user_id)

            if user.is_active:
                return Response({"message": "User is already active."}, status=status.HTTP_400_BAD_REQUEST)

            user.is_active = True
            user.save()

            return Response({"message": "User reactivated successfully."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class AssignRoleView(generics.GenericAPIView):
    """
    API view for assigning a role to a user.

    Permissions:
        - Only admin users can access this endpoint.
    """

    serializer_class = AssignRoleSerializer
    permission_classes = [IsAdminUser] 
    
    def post(self, request, user_id):
        """
        Handles role assignment to a user.

        Args:
            request (Request): The HTTP request containing the role name.
            user_id (int): The ID of the user to whom the role will be assigned.

        Returns:
            Response: A success message if the role is assigned,
                        an error message if validation fails or the user/role is not found.
        """
        
        user = get_object_or_404(User, id=user_id)
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            role_name = serializer.validated_data['role_name']
            role = get_object_or_404(Role, name=role_name)
            
            user.roles.add(role)
            return Response({"message": f"Role '{role_name}' assigned to user {user.username}."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RevokeRoleView(generics.GenericAPIView):
    """
    API view for revoking a role from a user.

    Permissions:
        - Only admin users can access this endpoint.
    """

    serializer_class = AssignRoleSerializer
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        """
        Handles revoking a role from a user.

        Args:
            request (Request): The HTTP request containing the role name.
            user_id (int): The ID of the user from whom the role will be revoked.

        Returns:
            Response: A success message if the role is revoked,
                      an error message if validation fails or the user/role is not found.
        """

        user = get_object_or_404(User, id=user_id)
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            role_name = serializer.validated_data['role_name']
            role = get_object_or_404(Role, name=role_name)
            
            user.roles.remove(role)
            return Response({"message": f"Role '{role_name}' removed from user {user.username}."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetUserRolesView(generics.GenericAPIView):
    """
    API view for retrieving the roles assigned to a specific user.

    Permissions:
        - Only admin users can access this endpoint.
    """

    permission_classes = [IsAdminUser]
    serializer_class = RoleSerializer

    def get(self, request, user_id):
        """
        Retrieves the roles assigned to a specific user.

        Args:
            request (Request): The HTTP request object.
            user_id (int): The ID of the user whose roles are being retrieved.
        
        Returns:
            Response: A response containing the list of roles assigned to the user.
            - HTTP 200: Roles retrieved successfully.
            - HTTP 404: User not found.
        """
                
        user = get_object_or_404(User, id=user_id)
        roles = user.roles.all()
        serializer = self.get_serializer(roles, many=True)
        
        return Response(serializer.data)