from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Role

@receiver(post_migrate)
def create_roles(sender, **kwargs):

  default_roles = ["Admin", "Lecturer", "Student", "TeachingAssistant"]
  
  for role_name in default_roles:
      Role.objects.get_or_create(name=role_name)