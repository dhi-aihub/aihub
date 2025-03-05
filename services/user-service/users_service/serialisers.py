from .models import User, Role
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
  
    roles = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_staff', 'roles']
        read_only_fields = ['id', 'username', 'date_joined', 'is_staff']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["is_staff"] = user.is_staff

        roles = list(user.roles.values_list("name", flat=True))
        token["roles"] = roles

        return token
    
class CreateAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_admin(**validated_data)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance
    
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, data):
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
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class AssignRoleSerializer(serializers.Serializer):
    role_name = serializers.CharField()

    def validate_role_name(self, value):
        if not Role.objects.filter(name=value).exists():
            raise serializers.ValidationError("Role does not exist.")
        return value