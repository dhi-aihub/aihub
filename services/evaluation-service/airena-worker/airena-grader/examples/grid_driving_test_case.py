from typing import List

import gymnasium as gym

from airena_grader.abc.evaluator import Evaluator
from airena_grader.abc.test_case import TestCase


class GridDrivingTestCase(TestCase):
    """Custom test case for grid driving task"""

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
            if self.use_seed:
                # this is not the correct implementation of seeds in Gym env
                # but for backward compatible purposes I followed how Rizki did it...
                self.env.random_seed = self.seeds[i_episode]
            state = self.env.reset()
            agent.reset()
            self.evaluator.reset()
            for t in range(self.t_max):
                action = agent.step(state)
                next_state, reward, done, info = self.env.step(action)
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
