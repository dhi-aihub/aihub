from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission

class Role(models.Model):
    ROLE_CHOICES = [
      ("Admin", "Admin"),
      ("Lecturer", "Lecturer"),
      ("Student", "Student"),
      ("TeachingAssistant", "Teaching Assistant"),
    ]
        
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class CustomUserManager(BaseUserManager):

    def create_user(self, username, email, password=None, **extra_fields):

        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_admin(self, username, email, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)

        user = self.create_user(username, email, password, **extra_fields)

        admin_role, _ = Role.objects.get_or_create(name="Admin")
        user.roles.add(admin_role)

        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_admin(username, email, password, **extra_fields)

class User(AbstractUser):
    roles = models.ManyToManyField(Role, related_name="users")

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
      return self.roles.filter(name=role_name).exists()
