import multiprocessing
import time
from multiprocessing import Process, Queue

import gymnasium as gym
import numpy
from airena_gym import AgentEnv
from airena_gym import EnvSerializer
from airena_gym import JudgeEnv

from airena_grader.abc.agent import Agent
from airena_grader.evaluator import StepCountEvaluator
from airena_grader.test_case import ReinforcementLearningTestCase
from airena_grader.test_suite import TestSuite


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


class CartPoleJudgeEnv(JudgeEnv):
    def __init__(self):
        self.env = gym.make("CartPole-v1")
        super().__init__(
            CartPoleEnvSerializer(),
            self.env.action_space,
            self.env.observation_space,
        )

    def step(self, action):
        return self.env.step(action)

    def reset(self, seed=None):
        return self.env.reset(seed=seed)

    def render(self):
        return self.env.render()

    def close(self):
        self.env.close()


class CartPoleAgentEnv(AgentEnv):
    def __init__(self, port: int):
        base_env = gym.make("CartPole-v1")
        super().__init__(
            CartPoleEnvSerializer(),
            base_env.action_space,
            base_env.observation_space,
            uid=0,
            port=port
        )  # uid can be any int for single-agent agent env


class CartPoleAgent(Agent):
    def step(self, state):
        return gym.spaces.Discrete(2).sample()

    def reset(self):
        pass


def create_agent(**kwargs):
    return CartPoleAgent()


def run_judge(return_queue: Queue):
    judge_env = CartPoleJudgeEnv()
    return_queue.put(judge_env.bind())
    judge_env.start()


def main():
    manager = multiprocessing.Manager()
    return_queue = manager.Queue()
    judge_proc = Process(target=run_judge, args=(return_queue,))
    judge_proc.start()
    port = None
    for _ in range(10):  # wait for up to 10 seconds
        time.sleep(1)
        if not return_queue.empty():
            port = return_queue.get()
            break
    if not isinstance(port, int):
        raise Exception("judge process not properly initialized")
    try:
        n_runs = 10
        env = CartPoleAgentEnv(port=port)
        evaluator = StepCountEvaluator()
        seeds = [2333 for _ in range(n_runs)]
        test_case = ReinforcementLearningTestCase(
            t_max=10000,
            env=env,
            evaluator=evaluator,
            agent_init={},
            seeds=seeds,
            case_id=0,
            time_limit=3600,
            n_runs=n_runs,
        )
        test_suite = TestSuite(suite_id="cart_pole_test", cases=[test_case])
        res = test_suite.run(create_agent)
        print(res)
    finally:
        judge_proc.terminate()


if __name__ == "__main__":
    main()
