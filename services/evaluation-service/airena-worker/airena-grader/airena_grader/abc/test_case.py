from abc import ABCMeta, abstractmethod
from typing import Callable

import gymnasium as gym

from .agent import Agent
from .evaluator import Evaluator, EvaluationResult
from .util import time_limiter


class TestCase(metaclass=ABCMeta):
    """Abstract base class for test cases."""

    def __init__(
        self,
        case_id,
        time_limit: float,
        n_runs: int,
        agent_init: dict,
        env: gym.Env,
        evaluator: Evaluator,
    ):
        """
        :param case_id:
        :param time_limit: time limit in seconds
        :param n_runs: number of episodes to run
        :param agent_init: init params passed to __init__ method of Agent
        :param env: OpenAI Gym compatible environment
        :param evaluator: Evaluator object
        """
        self.case_id = case_id
        self.time_limit = time_limit
        self.n_runs = n_runs
        self._agent_init = {} if agent_init is None else agent_init
        self.env = env
        self.evaluator = evaluator

    @abstractmethod
    def run(self, agent) -> EvaluationResult:
        """Runs `env` with `agent` for `n_runs` times with `evaluator` attached.

        :param agent: an Agent
        :return: EvaluationResult
        """
        pass

    def evaluate(self, create_agent: Callable[..., Agent]) -> EvaluationResult:
        """Runs `env` with provided agent for `n_runs` times under `time_limit`
        with `evaluator` attached.

        :param create_agent: a function that returns an Agent
        :return: EvaluationResult
        """
        try:
            with time_limiter(self.time_limit):
                agent = create_agent(**self._agent_init)
                return self.run(agent)
        except Exception as e:
            return self._terminate(e)

    def _terminate(self, e: Exception) -> EvaluationResult:
        self.evaluator.terminate(e)
        return self.evaluator.get_result()
