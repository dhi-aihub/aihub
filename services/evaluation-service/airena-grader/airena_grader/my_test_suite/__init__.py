from aivle_grader.test_suite import TestSuite
from aivle_grader.my_test_suite.my_test_suite import test_cases

"""Example
seeds = [i * 26 for i in range(runs)]
env = gym.make("...")
evaluator = RewardEvaluator()
tc = ReinforcementLearningTestCase(t_max=10000, env=env, evaluator=evaluator, 
                                    seeds=seeds, case_id=0, time_limit=3600, n_runs=runs)
test_cases = [tc]
"""


test_suite = TestSuite("Deep Q-learning", test_cases)
