import gymnasium as gym

from .abc.evaluator import Evaluator

class TrainingEnv(gym.Wrapper):
    def __init__(self, env: gym.Env, evaluator: Evaluator):
        super().__init__(env)
        self.evaluator = evaluator

    def reset(self, **kwargs):
        self.evaluator.reset()
        return self.env.reset(**kwargs)

    def step(self, action):
        observation, reward, terminated, truncated, info = self.env.step(action)
        done = terminated or truncated
        full_state = {
            "observation": observation,
            "action": action,
            "reward": reward,
            "done": done,
            "info": info,
        }
        self.evaluator.step(full_state)
        return observation, reward, terminated, truncated, info

    def get_result(self):
        return self.evaluator.get_result().get_json()