import logging

import gym
import ma_gym

from aivle_gym.env_serializer import EnvSerializer
from aivle_gym.judge_multi_env import JudgeMultiEnv


class PongJudgeEnv(JudgeMultiEnv):
    def __init__(self, port=None):
        self.env = gym.make("PongDuel-v0")
        super().__init__(
            PongEnvSerializer(),
            self.env.action_space,
            self.env.observation_space,
            self.env.reward_range,
            self.env.n_agents,
            {0: 0, 1: 1},
            port=port,
        )

    def step(self, action):
        self.env.render()
        return self.env.step(action)

    def reset(self):
        return self.env.reset()

    def render(self, mode="human"):
        return self.env.render(mode=mode)

    def close(self):
        pass  # TODO

    def seed(self, seed=None):
        pass  # TODO


class PongEnvSerializer(EnvSerializer):
    def action_to_json(self, action):
        return action

    def json_to_action(self, action_json):
        return action_json

    def observation_to_json(self, obs):
        return obs

    def json_to_observation(self, obs_json):
        return obs_json

    def info_to_json(self, info):
        return info

    def json_to_info(self, info_json):
        return info_json


def main():
    env = PongJudgeEnv(port=5555)
    env.bind()
    env.start()


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    main()
