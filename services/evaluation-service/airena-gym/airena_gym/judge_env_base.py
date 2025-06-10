import abc

import gymnasium as gym

from .env_serializer import EnvSerializer


class JudgeEnvBase(gym.Env):
    # Set this in SOME subclasses
    metadata = {"render.modes": []}
    spec = None

    def __init__(
            self,
            serializer: EnvSerializer,
            action_space,
            observation_space,
            port,
    ):
        assert port is None or isinstance(port, int)
        assert isinstance(serializer, EnvSerializer)
        self.port = port
        self.serializer = serializer
        self.action_space = action_space
        self.observation_space = observation_space

    @abc.abstractmethod
    def bind(self):
        pass

    @abc.abstractmethod
    def start(self):
        pass

    @abc.abstractmethod
    def step(self, action):
        pass

    @abc.abstractmethod
    def reset(self):
        pass

    @abc.abstractmethod
    def render(self):
        pass

    @abc.abstractmethod
    def close(self):
        pass

    @abc.abstractmethod
    def seed(self, seed=None):
        pass
