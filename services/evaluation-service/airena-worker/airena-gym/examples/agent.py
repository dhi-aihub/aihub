import logging
import time

import gymnasium as gym

from airena_gym import AgentEnv
from judge import CartPoleEnvSerializer


class CartPoleAgentEnv(AgentEnv):
    def __init__(self, port):
        base_env = gym.make("CartPole-v1")
        super().__init__(
            CartPoleEnvSerializer(),
            base_env.action_space,
            base_env.observation_space,
            uid=0,
            port=port
        )  # uid can be any int for single-agent agent env


def main():
    env = CartPoleAgentEnv(port=5555)
    for i_episode in range(10):
        env.reset()
        for t in range(100):
            env.render()
            time.sleep(0.1)
            action = env.action_space.sample()
            observation, reward, terminated, truncated, info = env.step(action)
            done = terminated or truncated
            if done:
                logging.info("Episode finished after {} timesteps".format(t + 1))
                break
        time.sleep(2)
    env.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    main()
