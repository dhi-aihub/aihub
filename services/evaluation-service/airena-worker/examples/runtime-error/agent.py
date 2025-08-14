import gymnasium as gym

from airena_grader.abc.agent import Agent


class CartPoleAgent(Agent):
    def step(self, state):
        error = 1 / 0  # Simulating a runtime error
        return gym.spaces.Discrete(2).sample()

    def reset(self):
        pass
