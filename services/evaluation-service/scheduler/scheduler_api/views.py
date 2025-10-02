from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Job, TrainingJob, Queue
from .serializers import JobSerializer, TrainingJobSerializer, QueueSerializer
from .celery_app import app

import logging

logger = logging.getLogger("django")


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "task_id", "submission_id", "group_id"]

    @action(detail=True)
    def start(self, request, pk=None):
        if "task_id" not in request.data or "worker_name" not in request.data:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    "status": "failed",
                    "reason": "fields `task_id` and `worker_name` must be present",
                },
            )
        celery_task_id = request.data["task_id"]
        worker_name = request.data["worker_name"]
        job = self.get_object()
        if job.celery_task_id != celery_task_id:
            return Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={"status": "failed", "reason": "incorrect celery_task_id"},
            )
        job.status = Job.STATUS_RUNNING
        # job.worker_name = worker_name
        job.save()
        logger.info(f"task started: {celery_task_id} on {worker_name}")
        return Response(
            {
                "status": "success",
                "task": job.task_id,
                "submission": job.submission_id,
                "group": job.group_id,
                "run_time_limit": job.run_time_limit,
                "ram_limit": job.ram_limit,
                "vram_limit": job.vram_limit,
            }
        )

    @action(detail=True)
    def complete(self, request, pk=None):
        job = self.get_object()
        celery_task_id = request.data["task_id"]
        success = request.data["ok"]

        if job.status != Job.STATUS_RUNNING:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={"status": "failed", "reason": "job is not running"},
            )

        if job.celery_task_id != celery_task_id:
            return Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={"status": "failed", "reason": "incorrect task_id"},
            )

        if success:
            job.status = Job.STATUS_DONE
        else:
            job.status = Job.STATUS_ERROR

        job.save()
        return Response({"status": "success"})

    @action(detail=True)
    def update_job_error(self, request, pk=None):
        if "task_id" not in request.data or "error" not in request.data:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    "status": "failed",
                    "reason": "fields `task_id` and `error` must be present",
                },
            )
        task_id = request.data["task_id"]
        error = request.data["error"]
        job = self.get_object()
        if job.task_id != task_id:
            return Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={"status": "failed", "reason": "incorrect task_id"},
            )
        job.error = error
        job.save()

        return Response({
            "status": "success",
            "job": job.pk,
        })
    

class TrainingJobViewSet(ModelViewSet):
    queryset = TrainingJob.objects.all()
    serializer_class = TrainingJobSerializer

    @action(detail=True)
    def start(self, request, pk=None):
        if "task_id" not in request.data or "worker_name" not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
            "status": "failed",
            "reason": "fields `task_id` and `worker_name` must be present"
            })
        celery_task_id = request.data["task_id"]
        worker_name = request.data["worker_name"]
        training_job = self.get_object()
        if training_job.celery_task_id != celery_task_id:
            return Response(status=status.HTTP_401_UNAUTHORIZED, data={
            "status": "failed",
            "reason": "incorrect celery_task_id"
            })
        training_job.status = TrainingJob.STATUS_RUNNING
        #training_job.worker_name = worker_name
        training_job.save()
        logger.info(f"training task started: {celery_task_id} on {worker_name}")
        return Response({
            "status": "success",
            "task": training_job.task_id,
            "agent": training_job.agent_id,
        })
    
    @action(detail=True)
    def complete(self, request, pk=None):
        training_job = self.get_object()
        celery_task_id = request.data["task_id"]
        success = request.data["ok"]

        if training_job.status != TrainingJob.STATUS_RUNNING:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
                "status": "failed",
                "reason": "training job is not running"
            })

        if training_job.celery_task_id != celery_task_id:
            return Response(status=status.HTTP_401_UNAUTHORIZED, data={
                "status": "failed",
                "reason": "incorrect task_id"
            })

        if success:
            training_job.status = TrainingJob.STATUS_DONE
        else:
            training_job.status = TrainingJob.STATUS_ERROR

        training_job.save()
        return Response({"status": "success"})
    
    @action(detail=True)
    def update_job_error(self, request, pk=None):
        if "task_id" not in request.data or "error" not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
                "status": "failed",
                "reason": "fields `task_id` and `error` must be present"
            })
        task_id = request.data["task_id"]
        error = request.data["error"]
        training_job = self.get_object()
        if training_job.task_id != task_id:
            return Response(status=status.HTTP_401_UNAUTHORIZED, data={
                "status": "failed",
                "reason": "incorrect task_id"
            })
        training_job.error = error
        training_job.save()
        return Response({
            "status": "success",
            "training_job": training_job.pk,
        })


class QueueViewSet(ModelViewSet):
    queryset = Queue.objects.all()
    serializer_class = QueueSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name"]

    # worker_param = openapi.Parameter('worker', openapi.IN_QUERY, type=openapi.TYPE_STRING, required=True,
    #                                 description='Celery worker name')

    @action(detail=True, methods=["get"])
    # @swagger_auto_schema(manual_parameters=[worker_param])
    def stop_consuming(self, request, pk):
        if "worker" not in request.query_params:
            return Response(
                data={"reason": "no worker found in param"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queue = self.get_object()
        worker = request.query_params["worker"]
        logger.info(f"stop consuming from {queue} in {worker}")
        app.control.cancel_consumer(queue.name, destination=[worker], reply=True)
        return Response(status=status.HTTP_200_OK)

    # @swagger_auto_schema(manual_parameters=[worker_param])
    @action(detail=True, methods=["get"])
    def resume_consuming(self, request, pk):
        if "worker" not in request.query_params:
            return Response(
                data={"reason": "no worker found in param"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queue = self.get_object()
        worker = request.query_params["worker"]
        logger.info(f"resume consuming from {queue} in {worker}")
        app.control.add_consumer(queue.name, destination=[worker], reply=True)
        return Response(status=status.HTTP_200_OK)
