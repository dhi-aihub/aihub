import json
import logging
import os

import requests

from .constants import SANDBOX_ONLY_TASK_ID
from .errors import QueueInfoNotFound, StopConsumingError, ResumeConsumingError
from .models import QueueInfo, Submission, ExecutionOutput
from .settings import SCHEDULER_BASE_URL, FILE_SERVICE_BASE_URL, ACCESS_TOKEN, WORKER_NAME, FULL_WORKER_NAME

logger = logging.getLogger("root")


def get_task_url(task_id: int):
    return FILE_SERVICE_BASE_URL + f"/tasks/{task_id}/download_grader/"


def get_agent_url(submission_id: int):
    return FILE_SERVICE_BASE_URL + f"/submissions/{submission_id}/download/"


def get_task_info(task_id: int):
    # return dummy data for negative task ID (local test)
    return {
        "id": 1,
        "grader": "courses/2/tasks/asdasd/grader/grader.zip",
        "template": "courses/2/tasks/asdasd/template/agent.zip",
        "daily_submission_limit": 100,
        "max_upload_size": 5120,
        "run_time_limit": 60,
        "course": 1,
        "name": "asdasd",
        "description": "asdasd",
        "ram_limit": 256,
        "vram_limit": 256,
        "opened_at": "2022-01-30T01:47:31+08:00",
        "deadline_at": "2022-01-30T01:47:30+08:00",
        "closed_at": "2022-01-30T01:47:30+08:00",
        "created_at": "2022-01-30T01:47:53.223015+08:00",
        "updated_at": "2022-02-07T22:03:11.244212+08:00",
        "eval_queue": 1
    }


def start_job(job_id, celery_task_id) -> Submission:
    worker_name = WORKER_NAME
    resp = requests.get(SCHEDULER_BASE_URL + f"/api/jobs/{job_id}/start/",
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"},
                        data={
                            "worker_name": worker_name,
                            "task_id": celery_task_id
                        })
    if resp.status_code != 200:
        raise Exception(resp.content)
    obj = json.loads(resp.content)
    return Submission(sid=obj["agent"], task_url=get_task_url(obj["task"]),
                      agent_url=get_agent_url(obj["agent"]), task_id=int(obj["task"]))


def submit_job(job_id, task_id, output: ExecutionOutput):
    resp = requests.get(SCHEDULER_BASE_URL + f"/jobs/{job_id}/complete/",
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"},
                        data={
                            "task_id": task_id,
                            "ok": output.ok,
                            "raw_log": output.raw,
                            "result": output.result,
                            "error": output.error,
                        })
    return resp


def update_job_error(job_id: int, task_id: str, error: str):
    resp = requests.get(SCHEDULER_BASE_URL + f"/jobs/{job_id}/update_job_error/",
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"},
                        json={
                            "task_id": task_id,
                            "error": error
                        })
    return resp


def get_queue_info(queue_name: str) -> QueueInfo:
    resp = requests.get(SCHEDULER_BASE_URL + f"/queue/", params={"name": queue_name},
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"})
    results = resp.json()["results"]
    if len(results) == 0:
        raise QueueInfoNotFound()
    result = results[0]
    return QueueInfo(pk=int(result["id"]), name=result["name"], cpu=result["cpu_required"], ram=result["ram_required"],
                     vram=result["vram_required"])


def stop_consuming(queue: QueueInfo):
    resp = requests.get(SCHEDULER_BASE_URL + f"/queue/{queue.pk}/stop_consuming/", params={"worker": FULL_WORKER_NAME},
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"})
    if resp.status_code != 200:
        raise StopConsumingError(f"stop consuming failed [{resp.status_code}]: {resp.content}")


def resume_consuming(queue: QueueInfo):
    resp = requests.get(SCHEDULER_BASE_URL + f"/queue/{queue.pk}/resume_consuming/", params={"worker": FULL_WORKER_NAME},
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"})
    if resp.status_code != 200:
        raise ResumeConsumingError(f"resume consuming failed [{resp.status_code}]: {resp.content}")
