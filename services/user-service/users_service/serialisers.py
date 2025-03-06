from .models import User, Role
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    Serializes user data including roles, while ensuring that
    some fields remain read-only.
    """
  
    roles = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_staff', 'roles']
        read_only_fields = ['id', 'username', 'date_joined', 'is_staff']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer for obtaining JWT tokens.

    Adds the user's username, is_staff status, and roles to the token payload.
    """
    
    @classmethod
    def get_token(cls, user):
        """
        Generates a JWT token with additional user details.

        Args:
            user (User): The authenticated user.
        
        Returns:
            dict: The token payload containing user details.
        """

        token = super().get_token(user)

        token["username"] = user.username
        token["is_staff"] = user.is_staff

        roles = list(user.roles.values_list("name", flat=True))
        token["roles"] = roles

        return token
    
class CreateAdminSerializer(serializers.ModelSerializer):
    """
    Serializer for creating an admin user.

    Handles admin creation while ensuring the password field remains write-only.
    """

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """
        Creates a new admin user.

        Args:
            validated_data (dict): The validated data for admin creation.
        
        Returns:
            User: The newly created admin user.
        """

        return User.objects.create_admin(**validated_data)

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for handling password changes.

    Requires the old password for verification and applies Django's password validation.
    """

    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate_old_password(self, value):
        """
        Validates that the old password matches the user's current password.

        Args:
            value (str): The old password provided by the user.
        
        Returns:
            str: The validated old password.
        
        Raises:
            serializers.ValidationError: If the old password is incorrect.
        """

        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        
        return value

    def update(self, instance, validated_data):
        """
        Updates the user's password with the new password.

        Args:
            instance (User): The user instance whose password is being changed.
            validated_data (dict): The validated new password data.
        
        Returns:
            User: The updated user instance.
        """

        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance
    
class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logging out a user by blacklisting the refresh token.
    """

    refresh = serializers.CharField()

    def validate(self, data):
        """
        Blacklists the provided refresh token to log the user out.

        Args:
            data (dict): The request data containing the refresh token.
        
        Returns:
            dict: The validated data.
        
        Raises:
            serializers.ValidationError: If the token is invalid or expired.
        """

        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh_token = data["refresh"]
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            raise serializers.ValidationError("Invalid or expired token.")

        return data

class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Role model.

    Serializes role-related data, including its ID, name, and description.
    """

    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class AssignRoleSerializer(serializers.Serializer):
    """
    Serializer for assigning a role to a user.
    """

    role_name = serializers.CharField()

    def validate_role_name(self, value):
        """
        Validates that the provided role name exists in the database.

        Args:
            value (str): The name of the role to be assigned.
        
        Returns:
            str: The validated role name.
        
        Raises:
            serializers.ValidationError: If the role does not exist.
        """

        if not Role.objects.filter(name=value).exists():
            raise serializers.ValidationError("Role does not exist.")
        
        return value