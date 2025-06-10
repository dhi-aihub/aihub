import logging

import gymnasium as gym
import numpy

from airena_gym import EnvSerializer
from airena_gym import JudgeEnv


class CartPoleJudgeEnv(JudgeEnv):
    def __init__(self, port=None):
        self.env = gym.make("CartPole-v1", render_mode="human")
        super().__init__(
            CartPoleEnvSerializer(),
            self.env.action_space,
            self.env.observation_space,
            port=port
        )

    def step(self, action):
        return self.env.step(action)

    def reset(self):
        return self.env.reset()

    def render(self):
        return self.env.render()

    def close(self):
        self.env.close()

    def seed(self, seed=None):
        self.env.seed(seed)


class CartPoleEnvSerializer(EnvSerializer):
    def action_to_json(self, action):
        return int(action)

    def json_to_action(self, action_json):
        return action_json

    def observation_to_json(self, obs):
        return obs.tolist()

    def json_to_observation(self, obs_json):
        return numpy.array(obs_json)

    def info_to_json(self, info):
        return info

    def json_to_info(self, info_json):
        return info_json


def main():
    env = CartPoleJudgeEnv(port=5555)
    env.bind()
    env.start()


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    main()
