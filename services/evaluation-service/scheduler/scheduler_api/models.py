from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class Job(models.Model):
    STATUS_QUEUED = 'Q'
    STATUS_RUNNING = 'R'
    STATUS_ERROR = 'E'
    STATUS_DONE = 'D'
    STATUSES = [
        (STATUS_QUEUED, 'Queued'),
        (STATUS_RUNNING, 'Running'),
        (STATUS_ERROR, 'Error'),
        (STATUS_DONE, 'Done')
    ]

    task_id = models.PositiveIntegerField()
    submission_id = models.CharField(max_length=255)
    group_id = models.PositiveIntegerField()
    celery_task_id = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=2, choices=STATUSES, default=STATUS_QUEUED)
    run_time_limit = models.PositiveIntegerField(default=60)
    ram_limit = models.PositiveIntegerField(default=256)
    vram_limit = models.PositiveIntegerField(default=256)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def _get_status_description(status_char: str):
        for item in Job.STATUSES:
            if item[0] == status_char:
                return item[1]
        return "Unknown"

    def __str__(self):
        status = self._get_status_description(self.status)
        return f"Job {self.pk} - Task {self.task_id} - Submission {self.submission_id} - Status {status}"


class Queue(models.Model):
    name = models.CharField(max_length=64, unique=True)
    public = models.BooleanField(default=False)
    #course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    cpu_required = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(100)
        ]
    )  # CPU required in percentage
    ram_required = models.IntegerField()  # RAM required in MiB
    vram_required = models.IntegerField()  # VRAM required in MiB

    def __str__(self):
        return self.name