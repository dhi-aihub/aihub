import gymnasium as gym
import json

from airena_trainer.evaluator import RewardEvaluator
from airena_trainer.trainer import Trainer

from agent import MyAgent

def main():
    # Create the environment
    env = gym.make("CartPole-v1")

    # Create a trainer with the environment and evaluator
    trainer = Trainer(env, RewardEvaluator())
    trainer.train_and_save(MyAgent)
    res = trainer.get_result()
    """
    # firejail
    print(json.dumps(res))
    """
    # not using firejail
    with open("stdout.log", "w") as f:
        f.write("\n\n" + json.dumps(res))


if __name__ == "__main__":
    main()