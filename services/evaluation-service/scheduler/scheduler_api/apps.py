from django.apps import AppConfig
from django.db.models.signals import post_migrate

class SchedulerApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'scheduler_api'

    def ready(self):
        import scheduler_api.signals
        
        from .signals import create_default_queues
        post_migrate.connect(create_default_queues, sender=self)
