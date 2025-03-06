from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Role

@receiver(post_migrate)
def create_roles(sender, **kwargs):
    """
    Signal handler that ensures default roles exist after database migrations.

    This function runs after migrations and creates predefined roles if they do not already exist.

    Args:
        sender (Model): The model class that sent the signal.
        **kwargs: Additional keyword arguments.
    """

    default_roles = ["Admin", "Lecturer", "Student", "TeachingAssistant"]
    
    for role_name in default_roles:
        Role.objects.get_or_create(name=role_name)