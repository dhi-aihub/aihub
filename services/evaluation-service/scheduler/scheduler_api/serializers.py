from rest_framework import serializers
from .models import Job, TrainingJob, Queue

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class TrainingJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingJob
        fields = '__all__'

class QueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Queue
        fields = '__all__'
