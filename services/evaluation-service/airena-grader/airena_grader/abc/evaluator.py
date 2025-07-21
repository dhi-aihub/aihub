from abc import ABCMeta, abstractmethod


class EvaluationResult:
    """Data-only class for storing results produced by Evaluator.

    Normally, `results` store detailed info for every episode,
    `value` store a single cumulative score for all episodes.
    """

    def __init__(self, value, error, name: str = "score", results=None):
        if results is None:
            results = []
        self.name = name
        self.results = results
        self.value = value
        self.error = error

    def __str__(self):
        return str(self.get_json())

    def get_json(self) -> dict:
        return {
            "name": self.name,
            "detail": self.results,
            "value": self.value,
            "error": self.error,
        }


class Evaluator(metaclass=ABCMeta):
    """Abstract base class for recording and evaluating agent's performance."""

    def __init__(self):
        self.error = None

    @abstractmethod
    def reset(self) -> None:
        """Starts a new episode - call this once at the beginning of each episode.

        WARNING: calling `reset` on an evaluator will NOT clear records from previous
        episodes. You may create a new instance of Evaluator for that.

        :return: None
        """
        pass

    @abstractmethod
    def step(self, full_state: dict) -> None:
        """Update some record from `full_state` received from the latest step -
        call this once right after every `env.step(action)`

        :param full_state: a dict of everything that needs to be stored at every
        step (typically observation, reward)

        :return: None
        """
        pass

    @abstractmethod
    def get_result(self) -> EvaluationResult:
        """Calculates and returns evaluation results - produce your cumulative
        scores in this method.

        :return: EvaluationResult
        """
        pass

    def terminate(self, e: Exception) -> None:
        """Terminates this Evaluator due to errors.

        :param e: an Exception
        :return: None
        """
        self.error = e
