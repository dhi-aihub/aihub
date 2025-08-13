from django.db import models

class Job(models.Model):
    taskId = models.PositiveIntegerField()
    agentId = models.PositiveIntegerField()
    celeryTaskId = models.CharField(max_length=255)

    def __str__(self):
        return f"Job {self.pk} - Task {self.taskId} - Agent {self.agentId} - Celery Task {self.celeryTaskId}"
