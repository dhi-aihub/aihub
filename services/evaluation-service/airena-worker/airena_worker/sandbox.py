import hashlib
import logging
import os
import subprocess
from typing import List

import zmq

from .constants import SANDBOX_ONLY_TASK_ID, ERROR_TIME_LIMIT_EXCEEDED, ERROR_RUNTIME_ERROR
from .settings import PROFILE_PATH, TEMP_VENV_FOLDER, CREATE_VENV_PATH, ZMQ_PORT

logger = logging.getLogger("root")


def create_venv(req_path: str, force: bool = False) -> str:
    """
    Create virtual environment (NOTE: this step happens outside of any security sandbox)

    :param req_path: path to the requirements.txt file
    :param force: if True, the cached environment will be overwritten
    :return: venv name
    """
    with open(req_path, "r") as f:
        req_str = f.read()
        f.close()
    env_name = hashlib.md5(req_str.encode("ascii")).hexdigest()
    dst_path = os.path.join(TEMP_VENV_FOLDER, env_name)
    if os.path.exists(dst_path) and not force:
        return env_name
    cmd = ["bash", CREATE_VENV_PATH, dst_path, req_path.strip()]
    # Reference: https://stackoverflow.com/a/4417735
    popen = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, universal_newlines=True)
    for stdout_line in iter(popen.stdout.readline, ""):
        print(stdout_line, end="")
    for stderr_line in iter(popen.stderr.readline, ""):
        print(stderr_line, end="")
    popen.stdout.close()
    return_code = popen.wait()
    if return_code:
        raise subprocess.CalledProcessError(return_code, cmd)
    return env_name


def run_with_venv(env_name: str, command: List[str], task_id: int, job_id: int, celery_task_id: str, home: str = "",
                  rlimit: int = 0, vram_limit: int = 256, time_limit: int = 0) -> str:
    """
    Run `command` within venv named `env_name`

    :param celery_task_id:
    :param job_id: ID of Job model in aiVLE Web
    :param env_name: venv name
    :param command:
    :param home: path to the home directory (check --private={HOME} in Firejail doc)
    :param rlimit: RAM limit in MiB (<=0 means no limit,
    :param task_id: aiVLE task ID (NOT evaluation job/task ID)
    :param vram_limit: VRAM limit in MiB
    :param time_limit:

    :return: error type (defined as constants in api)
    """
    # if task_id is -1, then we're running with sandbox only, no need to communicate with warden
    sandbox_only = task_id == SANDBOX_ONLY_TASK_ID
    """ 
    # Uncomment this if you want to use Firejail 
    full_cmd = ["firejail",
                # f"--profile={PROFILE_PATH}",
                "--noprofile",
                "--read-only=/tmp",
                f"--env=PATH={os.path.join(TEMP_VENV_FOLDER, env_name)}/bin:/usr/bin",
                # f"--output={os.path.join(home, 'stdout.log')}",
                f"--output-stderr={os.path.join(home, 'stdout.log')}", ]
    if rlimit > 0:
        full_cmd.append(f"--rlimit-as={rlimit * 1024 * 1024}")
    if home != "":
        full_cmd.append(f"--private={home}")
    else:
        full_cmd.append("--private")
    full_cmd.extend(command)
    """

    full_cmd = command.copy()

    venv_path = os.path.join(TEMP_VENV_FOLDER, env_name)
    venv_bin = os.path.join(venv_path, "bin")

    # Set up environment variables for the command
    env = os.environ.copy()
    env["PATH"] = f"{venv_bin}:{env['PATH']}"
    
    print(f"[SANDBOX | run_with_venv] venv_bin: {venv_bin}, command: {full_cmd}")
    logger.debug(f"[SANDBOX | run_with_venv] command: {' '.join(full_cmd)}")

    # remove env and cwd if firejail is used
    proc = subprocess.Popen(full_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, env=env, cwd=home)
    
    context = zmq.Context()
    socket = context.socket(zmq.REQ)
    if not sandbox_only:
        socket.connect(f"tcp://localhost:{ZMQ_PORT}")
        socket.send_pyobj({
            "message_type": "sandbox-start",
            "payload": {
                "job_id": job_id,
                "celery_task_id": celery_task_id,
                "pid": proc.pid,
                "vram_limit": vram_limit,
            },
        })
        _ = socket.recv()
        
    error_type = None
    if time_limit > 0:
        try:
            return_code = proc.wait(time_limit + 30)  # wait 30 more seconds
            if return_code != 0:
                error_type = ERROR_RUNTIME_ERROR
        except subprocess.TimeoutExpired:
            error_type = ERROR_TIME_LIMIT_EXCEEDED
    else:
        return_code = proc.wait()
        if return_code != 0:
            error_type = ERROR_RUNTIME_ERROR

    # result = subprocess.run(full_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    # print(result.returncode, result.stderr, result.stdout)
    if not sandbox_only:
        socket.send_pyobj({
            "message_type": "sandbox-finish",
            "payload": {
                "task_id": task_id,
                "pid": proc.pid,
                "vram_limit": vram_limit,
            },
        })
        _ = socket.recv()
    return error_type
