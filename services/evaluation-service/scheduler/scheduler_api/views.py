from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Job
from .serializers import JobSerializer


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    @action(detail=True)
    def start(self, request, pk=None):
        if "task_id" not in request.data or "worker_name" not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
                "status": "failed",
                "reason": "fields `task_id` and `worker_name` must be present"
            })
        celery_task_id = request.data["task_id"]
        worker_name = request.data["worker_name"]
        job = self.get_object()
        if job.celery_task_id != celery_task_id:
            return Response(status=status.HTTP_401_UNAUTHORIZED, data={
                "status": "failed",
                "reason": "incorrect celery_task_id"
            })
        job.status = Job.STATUS_RUNNING
        #job.worker_name = worker_name
        job.save()
        #logger.info(f"task started: {celery_task_id} on {worker_name}")
        return Response({
            "status": "success",
            "task": job.task_id,
            "submission": job.submission_id,
            "run_time_limit": job.run_time_limit,
            "ram_limit": job.ram_limit,
            "vram_limit": job.vram_limit,
        })

    @action(detail=True)
    def complete(self, request, pk=None):
        job = self.get_object()
        celery_task_id = request.data["task_id"]
        success = request.data["ok"]

        if job.status != Job.STATUS_RUNNING:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
                "status": "failed",
                "reason": "job is not running"
            })

        if job.celery_task_id != celery_task_id:
            return Response(status=status.HTTP_401_UNAUTHORIZED, data={
                "status": "failed",
                "reason": "incorrect task_id"
            })

        if success:
            job.status = Job.STATUS_DONE
        else:
            job.status = Job.STATUS_ERROR

        job.save()
        return Response({"status": "success"})
