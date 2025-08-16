from typing import Union


class QueueInfo:
    """
    CPU: percentage (integer)
    RAM and VRAM: MiB (integer)
    """

    def __init__(self, pk: int, name: str, cpu: int, ram: int, vram: int):
        self.pk = pk
        self.name = name
        self.cpu = cpu
        self.ram = ram
        self.vram = vram

    def __str__(self):
        return f"Resource Constraint - CPU {self.cpu}%, RAM {self.ram}MiB, VRAM {self.vram}MiB"


class ExecutionOutput:
    def __init__(self, ok: bool, raw: str, result: Union[str, None], error: Union[str, None]):
        self.ok = ok
        self.raw = raw
        self.result = result
        self.error = error
        
    def __str__(self):
        return f"ExecOut - Ok: {self.ok} - Result: {self.result} - Error: {self.error}"


class Submission:
    def __init__(self, sid: int, task_url: str, agent_url: str, task_id: int):
        """
        :param sid:
        :param task_url:
        :param agent_url:
        :param task_id: NOT Celery task ID! This corresponds to an AI task, not a Celery evaluation task/job!
        """
        self.sid = sid
        self.task_url = task_url
        self.agent_url = agent_url
        self.task_id = task_id

    def __str__(self):
        return f"Submission-{self.sid}-<{self.task_url}>-<{self.agent_url}>-<{self.task_id}>"


class Job:
    def __init__(self, job_id: int, submission: Submission, run_time_limit: int, ram_limit: int, vram_limit: int):
        self.job_id = job_id
        self.submission = submission
        self.run_time_limit = run_time_limit
        self.ram_limit = ram_limit
        self.vram_limit = vram_limit

    def __str__(self):
        return f"Job-{self.job_id}"