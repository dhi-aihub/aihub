import gymnasium as gym

from .abc.agent import Agent
from .abc.evaluator import Evaluator
from .training_env import TrainingEnv

class Trainer:
    def __init__(self, env: gym.Env, evaluator: Evaluator):
        self.is_trained = False
        self.evaluator = evaluator
        self.env = TrainingEnv(env, evaluator)

    def train_and_save(self, agent: type[Agent]):
        if self.is_trained:
            raise RuntimeError("Training has already been performed.")
        
        self.is_trained = True

        try:
            agent_instance = agent(self.env)
            agent_instance.train()
            agent_instance.save("agent.pth")
        except Exception as e:
            self.evaluator.terminate(e)

    def get_result(self) -> dict:
        if not self.is_trained:
            raise RuntimeError("Training has not been performed yet.")
        
        return self.evaluator.get_result().get_json()