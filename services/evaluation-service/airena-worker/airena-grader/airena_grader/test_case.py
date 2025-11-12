from typing import List

import gymnasium as gym

from .abc.evaluator import Evaluator
from .abc.test_case import TestCase


class ReinforcementLearningTestCase(TestCase):
    def __init__(
        self,
        t_max: int,
        seeds: List[int],
        case_id,
        time_limit: float,
        n_runs: int,
        env: gym.Env,
        evaluator: Evaluator,
        agent_init: dict = None,
    ):
        """
        Additional params please refer to `TestCase` base class.

        :param t_max: maximum steps per episode
        :param seeds: list of seeds for every episode, either empty or same length as n_runs
        """
        super().__init__(case_id, time_limit, n_runs, agent_init, env, evaluator)
        self.t_max = t_max
        self.seeds = seeds
        self.use_seed = len(self.seeds) > 0
        if self.use_seed:
            assert (
                len(self.seeds) == self.n_runs
            )  # provide fixed random seed for each episode

    def run(self, agent):
        for i_episode in range(self.n_runs):
            state = self.env.reset()
            if self.use_seed:
                state = self.env.reset(seed=self.seeds[i_episode])
            agent.reset()
            self.evaluator.reset()
            for t in range(self.t_max):
                action = agent.step(state)
                next_state, reward, terminated, truncated, info = self.env.step(action)
                done = terminated or truncated
                self.evaluator.step(
                    {
                        "state": state,
                        "action": action,
                        "reward": reward,
                        "next_state": next_state,
                        "done": done,
                        "info": info,
                        "episode_count": i_episode,
                        "t": t,
                    }
                )
                state = next_state
                if done:
                    break
        return self.evaluator.get_result()
