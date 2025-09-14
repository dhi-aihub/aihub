from airena_trainer.abc.agent import Agent

class MyAgent(Agent):
    def train(self, env, hyperparameters):
        # Implement training logic here
        pass

    def save(self, path):
        # Implement saving logic here
        pass

    def load(self, path):
        # Implement loading logic here
        pass