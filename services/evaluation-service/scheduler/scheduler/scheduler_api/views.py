from .models import Job
from .serializers import JobSerializer
from rest_framework import viewsets

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
