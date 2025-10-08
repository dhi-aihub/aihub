import gymnasium as gym

from .abc.agent import Agent
from .abc.evaluator import Evaluator
from .training_env import TrainingEnv

class Trainer:
    def __init__(self, env: gym.Env, evaluator: Evaluator, agent: type[Agent]) -> None:
        self.evaluator = evaluator
        self.env = TrainingEnv(env, evaluator)
        self.agent = agent(self.env)

    def train(self) -> None:
        try:
            self.agent.train()
        except Exception as e:
            self.evaluator.terminate(e)

    def save(self, path: str) -> None:
        self.agent.save(path)

    def load(self, path: str) -> None:
        self.agent.load(path)

    def get_result(self) -> dict:
        return self.evaluator.get_result().get_json()