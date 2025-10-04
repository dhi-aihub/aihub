import os
import socket
import tempfile

from dotenv import load_dotenv

from .errors import DotEnvFileNotFound, MissingDotEnvField


DOTENV_PATH = "./.env"
if not os.path.exists(DOTENV_PATH):
    raise DotEnvFileNotFound()
load_dotenv(verbose=True, dotenv_path=DOTENV_PATH)

# Sandbox config
package_directory = os.path.dirname(os.path.abspath(__file__))
PROFILE_PATH = os.path.join(package_directory, "profiles", "aivle-base.profile")  # "./profiles/aivle-base.profile"
CREATE_VENV_PATH = os.path.join(package_directory, "scripts", "create-venv.sh")  # "./scripts/create-venv.sh"
TEMP_FOLDER_ROOT = os.path.join(tempfile.gettempdir(), "aivle-worker")
if not os.path.isdir(TEMP_FOLDER_ROOT):
    os.mkdir(TEMP_FOLDER_ROOT)
TEMP_VENV_FOLDER = os.path.join(TEMP_FOLDER_ROOT, "venvs")
if not os.path.isdir(TEMP_VENV_FOLDER):
    os.mkdir(TEMP_VENV_FOLDER)
TEMP_GRADING_FOLDER = os.path.join(TEMP_FOLDER_ROOT, "grading")
if not os.path.isdir(TEMP_GRADING_FOLDER):
    os.mkdir(TEMP_GRADING_FOLDER)
LOCAL_FILE = True

# API config
def get_env_variable(var_name: str, default: str = None) -> str:
    value = os.getenv(var_name)
    if value is None and default is None:
        raise MissingDotEnvField(var_name)
    return value if value is not None else default

SCHEDULER_BASE_URL = get_env_variable("SCHEDULER_BASE_URL")
FILE_SERVICE_BASE_URL = get_env_variable("FILE_SERVICE_BASE_URL")
RESULT_SERVICE_BASE_URL = get_env_variable("RESULT_SERVICE_BASE_URL")
ACCESS_TOKEN = get_env_variable("ACCESS_TOKEN")
CELERY_BROKER_URI = get_env_variable("BROKER_URI")
CELERY_RESULT_BACKEND = "rpc"
CELERY_QUEUE = get_env_variable("TASK_QUEUE", "training")
CELERY_CONCURRENCY = get_env_variable("CELERY_CONCURRENCY", "1")
WORKER_NAME = get_env_variable("WORKER_NAME", "celery")
FULL_WORKER_NAME = f"{WORKER_NAME}@{socket.gethostname()}"

# Monitor config
ZMQ_PORT = get_env_variable("ZMQ_PORT", "15921")


def update_queue(val: str):
    global CELERY_QUEUE
    CELERY_QUEUE = val


def update_concurrency(val: int):
    global CELERY_CONCURRENCY
    CELERY_CONCURRENCY = str(val)
    print(CELERY_CONCURRENCY)


def update_worker_name(val: str):
    global WORKER_NAME, FULL_WORKER_NAME
    WORKER_NAME = val
    FULL_WORKER_NAME = f"{WORKER_NAME}@{socket.gethostname()}"


def update_zmq_port(val: int):
    global ZMQ_PORT
    ZMQ_PORT = str(val)
