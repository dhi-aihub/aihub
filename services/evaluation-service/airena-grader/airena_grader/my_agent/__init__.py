from .my_agent import DQNAgent

"""Example
class SampleAgent(Agent):
    def step(self, state):
        return gym.spaces.Discrete(2).sample()

    def reset(self):
        pass

def create_agent(case_id, *args, **kwargs):
    return SampleAgent()
"""


def create_agent(**kwargs):
    return DQNAgent(**kwargs)
