import gymnasium as gym

from airena_trainer.evaluator import RewardEvaluator
from airena_trainer.training_env import TrainingEnv

from agent import MyAgent

def main():
    # Create the environment
    env = gym.make("CartPole-v1")

    # Initialize the agent
    agent = MyAgent()

    # Define hyperparameters
    hyperparameters = {
        "learning_rate": 0.01,
        "discount_factor": 0.99,
        "episodes": 1000
    }

    # Create a training environment
    training_env = TrainingEnv(env, RewardEvaluator())

    # Train the agent
    agent.train(training_env, hyperparameters)

    # Save the trained agent
    agent.save("my_agent.pth")

    # Output the results
    print(training_env.result())


if __name__ == "__main__":
    main()