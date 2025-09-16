import gymnasium as gym
import json

from airena_trainer.evaluator import RewardEvaluator
from airena_trainer.training_env import TrainingEnv

from agent import MyAgent

def main():
    # Create the environment
    env = gym.make("CartPole-v1")

    # Define hyperparameters
    hyperparameters = {
        "learning_rate": 0.01,
        "discount_factor": 0.99,
        "episodes": 10
    }

    # Create a training environment
    training_env = TrainingEnv(env, RewardEvaluator())

    try:
        # Initialize the agent
        agent = MyAgent()

        # Train the agent
        agent.train(training_env, hyperparameters)

        # Save the trained agent
        agent.save("my_agent.pth")

        # Output the results
        res = {"error": None, "result": training_env.get_result()}
    except Exception as e:
        res = {"error": str(e), "result": None}
    """
    # firejail
    print(json.dumps(res))
    """
    # not using firejail
    with open("stdout.log", "w") as f:
        f.write("\n\n" + json.dumps(res))


if __name__ == "__main__":
    main()