import os
import shutil
import zipfile
import json

import requests

from .models import Submission, ExecutionOutput, Job
from .sandbox import create_venv, run_with_venv
from .settings import LOCAL_FILE, TEMP_GRADING_FOLDER
from .util import LocalFileAdapter, download_and_save
from .constants import ERROR_MEMORY_LIMIT_EXCEEDED, ERROR_TIME_LIMIT_EXCEEDED, ERROR_VRAM_LIMIT_EXCEEDED, ERROR_RUNTIME_ERROR


def _download_submission(s: Submission) -> str:
    temp_grading_folder = os.path.join(TEMP_GRADING_FOLDER, str(s.sid))
    if not os.path.exists(temp_grading_folder):
        os.mkdir(temp_grading_folder)
    session = requests.Session()
    if LOCAL_FILE:
        session.mount("file://", LocalFileAdapter())
    task_zip_path = os.path.join(temp_grading_folder, "task.zip")
    download_and_save(session, s.task_url, task_zip_path)
    with zipfile.ZipFile(task_zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_grading_folder)
    agent_zip_path = os.path.join(temp_grading_folder, "agent.zip")
    download_and_save(session, s.submission_url, agent_zip_path)
    with zipfile.ZipFile(agent_zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_grading_folder)
    return temp_grading_folder


def run_job(job: Job, celery_task_id: str, force: bool = False) -> ExecutionOutput:
    temp_grading_folder = _download_submission(job.submission)
    env_name = create_venv(os.path.join(temp_grading_folder, "requirements.txt"), force=force)
    time_out = run_with_venv(env_name=env_name,
                               command=["bash", "./bootstrap.sh"],
                               home=temp_grading_folder,
                               rlimit=job.ram_limit,
                               vram_limit=job.vram_limit,
                               time_limit=job.run_time_limit,
                               task_id=job.submission.task_id,
                               job_id=job.id,
                               celery_task_id=celery_task_id)
    
    try:
        with open(os.path.join(temp_grading_folder, "stdout.log"), "r") as f:
            raw_log = f.read()

            if time_out:
                return ExecutionOutput(ok=False, raw=raw_log, result=None, error=ERROR_TIME_LIMIT_EXCEEDED)
            elif "MemoryError" in raw_log:
                return ExecutionOutput(ok=False, raw=raw_log, result=None, error=ERROR_MEMORY_LIMIT_EXCEEDED)

            result = json.loads(raw_log.splitlines()[2])
            ok = all(case["result"].get("error") == "None" for case in result.get("results", []))
            if ok:
                return ExecutionOutput(ok=True, raw=raw_log, result=result, error=None)
            else:
                return ExecutionOutput(ok=False, raw=raw_log, result=result, error=ERROR_RUNTIME_ERROR)
    finally:
        shutil.rmtree(temp_grading_folder)
        