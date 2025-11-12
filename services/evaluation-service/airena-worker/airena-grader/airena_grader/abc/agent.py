from abc import ABCMeta, abstractmethod


class Agent(metaclass=ABCMeta):
    """Abstract base class for grader-compatible agents."""

    @abstractmethod
    def step(self, state):
        """Returns an action from observed state.

        :param state:
        :return: action
        """
        pass

    @abstractmethod
    def reset(self):
        """Resets internal state of this agent.

        :return: None
        """
        pass
