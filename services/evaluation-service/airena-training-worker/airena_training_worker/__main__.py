import logging

from .entry_point import start_sandbox, start

logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    start()
