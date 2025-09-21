import json
import logging

import requests

from .errors import QueueInfoNotFound, StopConsumingError, ResumeConsumingError
from .models import QueueInfo, Submission, ExecutionOutput, Job
from .settings import SCHEDULER_BASE_URL, FILE_SERVICE_BASE_URL, RESULT_SERVICE_BASE_URL, ACCESS_TOKEN, WORKER_NAME, FULL_WORKER_NAME

logger = logging.getLogger("root")


def get_task_url(task_id: int):
    return FILE_SERVICE_BASE_URL + f"/taskAsset/{task_id}/grader/download/"


def get_submission_url(submission_id: int):
    return FILE_SERVICE_BASE_URL + f"/submission/{submission_id}/download/"


def start_job(job_id, celery_task_id) -> Job:
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
    submission = Submission(sid=obj["submission"], task_url=get_task_url(obj["task"]),
                      submission_url=get_submission_url(obj["submission"]), task_id=int(obj["task"]))

    return Job(id=job_id, submission=submission, run_time_limit=obj["run_time_limit"], 
               ram_limit=obj["ram_limit"], vram_limit=obj["vram_limit"])


def submit_job(job_id, task_id, output: ExecutionOutput):
    resp = requests.get(SCHEDULER_BASE_URL + f"/api/jobs/{job_id}/complete/",
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"},
                        data={
                            "task_id": task_id,
                            "ok": output.ok,
                        })

    print(output)

    # submit to result service
    try:
        result_payload = {
            "submissionId": task_id,
            "evalRunId": job_id,
            "status": "PASSED" if output.ok else "ERROR",
            "score": 0,
            "metrics": output.result,
            "error": output.error,
            "artifactsUri": None,
        }
        result_resp = requests.post(
            RESULT_SERVICE_BASE_URL + "/results/results/",
            headers={"Authorization": f"Token {ACCESS_TOKEN}", "Content-Type": "application/json"},
            json=result_payload
        )
        if result_resp.status_code not in [200, 201]:
            logger.error(f"Result service error: {result_resp.status_code} {result_resp.content}")
        else:
            logger.info(f"Result submitted: {result_resp.json()}")
    except Exception as e:
        logger.error(f"Failed to submit result: {e}")

    return resp


def update_job_error(job_id: int, task_id: str, error: str):
    resp = requests.get(SCHEDULER_BASE_URL + f"/api/jobs/{job_id}/update_job_error/",
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"},
                        json={
                            "task_id": task_id,
                            "error": error
                        })
    return resp


def get_queue_info(queue_name: str) -> QueueInfo:
    resp = requests.get(SCHEDULER_BASE_URL + f"/api/queues/", params={"name": queue_name},
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"})
    results = resp.json()
    if len(results) == 0:
        raise QueueInfoNotFound()
    result = results[0]
    return QueueInfo(pk=int(result["id"]), name=result["name"], cpu=result["cpu_required"], ram=result["ram_required"],
                     vram=result["vram_required"])


def stop_consuming(queue: QueueInfo):
    resp = requests.get(SCHEDULER_BASE_URL + f"/api/queues/{queue.pk}/stop_consuming/", params={"worker": FULL_WORKER_NAME},
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"})
    if resp.status_code != 200:
        raise StopConsumingError(f"stop consuming failed [{resp.status_code}]: {resp.content}")


def resume_consuming(queue: QueueInfo):
    resp = requests.get(SCHEDULER_BASE_URL + f"/api/queues/{queue.pk}/resume_consuming/", params={"worker": FULL_WORKER_NAME},
                        headers={"Authorization": f"Token {ACCESS_TOKEN}"})
    if resp.status_code != 200:
        raise ResumeConsumingError(f"resume consuming failed [{resp.status_code}]: {resp.content}")
