from abc import ABC, abstractmethod
from ..training_env import TrainingEnv


class Agent(ABC):
    """Abstract base class for training an agent."""
    @abstractmethod
    def __init__(self, env: TrainingEnv):
        """Initialize the agent with the given training environment.

        :param env: The training environment.
        """
        self.env = env

    @abstractmethod
    def train(self) -> None:
        """Train the agent.

        :return: None
        """
        pass

    @abstractmethod
    def save(self, path: str) -> None:
        """Save the trained agent to the specified path.

        :param path: The path where the agent should be saved.

        :return: None
        """
        pass

    @abstractmethod
    def load(self, path: str) -> None:
        """Load a trained agent from the specified path.

        :param path: The path from where the agent should be loaded.

        :return: None
        """
        pass