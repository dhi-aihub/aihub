from django.apps import AppConfig


class SchedulerApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'scheduler_api'

    def ready(self):
        import scheduler_api.signals
        
