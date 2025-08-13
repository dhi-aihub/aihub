from django.db import models

class Job(models.Model):
    task_id = models.PositiveIntegerField()
    agent_id = models.PositiveIntegerField()
    celery_task_id = models.CharField(max_length=255)

    def __str__(self):
        return f"Job {self.pk} - Task {self.task_id} - Agent {self.agent_id} - Celery Task {self.celery_task_id}"
