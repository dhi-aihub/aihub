from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission

class Role(models.Model):
    """
    Represents a user role in the system.

    Attributes:
        name (str): The name of the role (Admin, Lecturer, Student, Teaching Assistant).
        description (str): A brief description of the role.
    """
        
    ROLE_CHOICES = [
      ("Admin", "Admin"),
      ("Lecturer", "Lecturer"),
      ("Student", "Student"),
      ("TeachingAssistant", "Teaching Assistant"),
    ]
        
    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        """Returns the string representation of the role."""

        return self.name
    
class CustomUserManager(BaseUserManager):
    """
    Custom manager for the User model.

    Provides methods to create regular users, admins, and superusers.
    """

    def create_user(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a regular user with the given details.

        Args:
            username (str): The username of the user.
            email (str): The user's email address.
            password (str, optional): The user's password. Defaults to None.
            **extra_fields: Additional fields for user creation.

        Returns:
            User: The created user instance.
        
        Raises:
            ValueError: If the email is not provided.
        """

        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)

        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        return user

    def create_admin(self, username, email, password=None, **extra_fields):
        """
        Creates and returns an admin user.

        Args:
            username (str): The admin's username.
            email (str): The admin's email address.
            password (str, optional): The admin's password. Defaults to None.
            **extra_fields: Additional fields for admin creation.

        Returns:
            User: The created admin user instance.
        """

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)

        user = self.create_user(username, email, password, **extra_fields)

        admin_role, _ = Role.objects.get_or_create(name="Admin")
        user.roles.add(admin_role)

        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a superuser.

        Args:
            username (str): The superuser's username.
            email (str): The superuser's email address.
            password (str, optional): The superuser's password. Defaults to None.
            **extra_fields: Additional fields for superuser creation.

        Returns:
            User: The created superuser instance.
        
        Raises:
            ValueError: If no password is provided.
        """

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not password:
            raise ValueError("Superusers must have a password")

        return self.create_admin(username, email, password, **extra_fields)

class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Attributes:
        roles (ManyToManyField): The roles assigned to the user.
        groups (ManyToManyField): Groups associated with the user.
        user_permissions (ManyToManyField): Permissions assigned to the user.
    """

    roles = models.ManyToManyField(Role, related_name="users", blank=True)

    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_groups", 
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions",
        blank=True
    )

    objects = CustomUserManager()

    def has_role(self, role_name):
        """
        Checks if the user has a specific role.

        Args:
            role_name (str): The name of the role to check.

        Returns:
            bool: True if the user has the role, False otherwise.
        """

        return self.roles.filter(name__iexact=role_name).exists()
