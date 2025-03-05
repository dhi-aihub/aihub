from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serialisers import AssignRoleSerializer, ChangePasswordSerializer, CreateAdminSerializer, CustomTokenObtainPairSerializer, LogoutSerializer, RoleSerializer, UserSerializer
from .permissions import IsAdminOrLecturer
from rest_framework import generics, status, permissions

User = get_user_model()

# Handles user sign-up
class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

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

# Handles user log in and returns JWT token
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Handles creation of admin account
class CreateAdminView(generics.CreateAPIView):

    serializer_class = CreateAdminSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):

        if not request.user.is_superuser:
            return Response({"error": "Only superusers can create admins"}, status=403)

        return super().post(request, *args, **kwargs)

# Handles user log out
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)

        if serializer.is_valid():
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieves information either about current user or admin can view any specific user
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
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
        user = request.user 
        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, user_id):
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

# Retrieves a list of all users
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrLecturer]

# Allows authenticated users to change their password
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Allows authenticated users to change their password.
        """
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            user = request.user
            serializer.update(user, serializer.validated_data)
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Allows admin to deactivate a user
class DeactivateUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):

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

# Allows admin to reactivate a user
class ReactivateUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):

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

    serializer_class = AssignRoleSerializer
    permission_classes = [IsAdminUser] 
    
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            role_name = serializer.validated_data['role_name']
            role = get_object_or_404(Role, name=role_name)
            
            user.roles.add(role)
            return Response({"message": f"Role '{role_name}' assigned to user {user.username}."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RevokeRoleView(generics.GenericAPIView):

    serializer_class = AssignRoleSerializer
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            role_name = serializer.validated_data['role_name']
            role = get_object_or_404(Role, name=role_name)
            
            user.roles.remove(role)
            return Response({"message": f"Role '{role_name}' removed from user {user.username}."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetUserRolesView(generics.RetrieveAPIView):

    permission_classes = [IsAdminUser]
    serializer_class = RoleSerializer

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        roles = user.roles.all()
        serializer = self.get_serializer(roles, many=True)
        
        return Response(serializer.data)