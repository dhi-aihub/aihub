import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from scheduler.settings import CELERY_ENABLE
from scheduler_api.models import Job
from scheduler_api.celery_app import evaluate

#logger = logging.getLogger('django')


@receiver(post_save, sender=Job)
def create_celery_task_with_job(sender, instance: Job, created, **kwargs):
    if not created:
        return  # prevent dead lock

    if CELERY_ENABLE:
        result = evaluate.apply_async(args=[instance.pk], queue='default') # instance.task.eval_queue.name
        instance.celery_task_id = result.id
    else:
        instance.celery_task_id = "dummy_task_id"
    # instance.status = Job.STATUS_QUEUED
    instance.save()
    #logger.info(f"{instance} created")
