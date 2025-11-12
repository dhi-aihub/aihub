import signal
from contextlib import contextmanager

from .exception import TimeoutException


@contextmanager
def time_limiter(seconds):
    # Reference: https://stackoverflow.com/a/601168
    if seconds:

        def signal_handler(signum, frame):
            raise TimeoutException("Timed out!")

        signal.signal(signal.SIGALRM, signal_handler)
        signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
