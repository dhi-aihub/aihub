import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from scheduler.settings import CELERY_ENABLE
from scheduler_api.models import TrainingJob
from scheduler_api.celery_app import train

logger = logging.getLogger('django')


@receiver(post_save, sender=TrainingJob)
def create_celery_task_with_training_job(sender, instance: TrainingJob, created, **kwargs):
    if not created:
        return  # prevent dead lock

    if CELERY_ENABLE:
        result = train.apply_async(args=[instance.pk], queue='training')
        instance.celery_task_id = result.id
    else:
        instance.celery_task_id = "dummy_task_id"
    # instance.status = Job.STATUS_QUEUED
    instance.save()
    logger.info(f"{instance} created")
