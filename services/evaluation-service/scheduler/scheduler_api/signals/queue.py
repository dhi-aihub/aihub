from ..models import Queue

def create_default_queues(sender, **kwargs):
    # Create queues if they don't exist
    Queue.objects.get_or_create(name="default", defaults={
        "public": True,
        "cpu_required": 50,
        "ram_required": 1024,
        "vram_required": 1024
    })
    Queue.objects.get_or_create(name="gpu", defaults={
        "public": True,
        "cpu_required": 50,
        "ram_required": 1024,
        "vram_required": 1024
    })
    Queue.objects.get_or_create(name="private", defaults={
        "public": False,
        "cpu_required": 50,
        "ram_required": 1024,
        "vram_required": 1024
    })
    Queue.objects.get_or_create(name="training", defaults={
        "public": True,
        "cpu_required": 50,
        "ram_required": 1024,
        "vram_required": 1024
    })