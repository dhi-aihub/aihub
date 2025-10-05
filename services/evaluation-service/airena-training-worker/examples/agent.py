from collections import namedtuple, deque
from itertools import count
import random
import math
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import gymnasium as gym

from airena_trainer.abc.agent import Agent

class DQN(nn.Module):
    """
    Deep Q-Network (DQN) class.

    Parameters:
        n_observations (int): Number of observations (input size).
        n_actions (int): Number of possible actions (output size).
    """

    def __init__(self, n_observations, n_actions):
        super(DQN, self).__init__()
        self.layer1 = nn.Linear(n_observations, 128) # First hidden layer with 128 neurons
        self.layer2 = nn.Linear(128, 128) # Second hidden layer with 128 neurons
        self.layer3 = nn.Linear(128, n_actions) # Output layer with n_actions neurons

    def forward(self, x):
        """
        Forward pass through the network.

        Parameters:
            x (tensor): Input tensor with shape (batch_size, n_observations).

        Returns:
            tensor: Output tensor with shape (batch_size, n_actions).
        """
        x = F.relu(self.layer1(x))
        x = F.relu(self.layer2(x))
        return self.layer3(x)
    

# Define the replay memory transition as a named tuple
Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward'))
    
class ReplayMemory(object):
    """Replay Memory implementation to store transitions and sample from them"""

    def __init__(self, capacity):
        """Initialize the Replay Memory

        Args:
        capacity (int): Maximum capacity of the Replay Memory
        """
        self.memory = deque([], maxlen=capacity)

    def push(self, *args):
        """Save a transition

        Args:
        *args: Tuple of state, action, next state, and reward
        """
        self.memory.append(Transition(*args))

    def sample(self, batch_size):
        """Sample a random batch of transitions

        Args:
        batch_size (int): Number of transitions to sample

        Returns:
        List of randomly sampled transitions from the Replay Memory
        """
        return random.sample(self.memory, batch_size)

    def __len__(self):
        """Return the length of the Replay Memory"""
        return len(self.memory)


class MyAgent(Agent):
    def __init__(self, env: gym.Env):
        super().__init__(env)
        # Set up the device to use (CPU or GPU)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Define the hyperparameters
        self.EPISODES = 300
        self.BATCH_SIZE = 128
        self.GAMMA = 0.99
        self.EPS_START = 0.9
        self.EPS_END = 0.05
        self.EPS_DECAY = 1000
        self.TAU = 0.005
        self.LR = 1e-4

        # Get number of actions and state observations
        n_actions = env.action_space.n
        state, _ = env.reset()
        n_observations = len(state)

        # Initialize policy and target networks
        self.policy_net = DQN(n_observations, n_actions).to(self.device)
        self.target_net = DQN(n_observations, n_actions).to(self.device)

        # Load the weights of the policy network to the target network
        self.target_net.load_state_dict(self.policy_net.state_dict())

        # Create an AdamW optimizer and pass the policy_net's parameters to it
        self.optimizer = optim.AdamW(self.policy_net.parameters(), lr=self.LR, amsgrad=True)

        # Initialize a replay memory with a capacity of 10000
        self.memory = ReplayMemory(10000)

        # Set the initial number of steps that the agent has taken to 0
        self.steps_done = 0

    def select_action(self, state):
        """
        Select an action to take based on the current state of the environment

        Args:
        - state (torch.tensor): current state of the environment

        Returns:
        - (torch.tensor): action to take based on the current state
        """
        sample = random.random() # generate a random number between 0 and 1
        eps_threshold = self.EPS_END + (self.EPS_START - self.EPS_END) * \
            math.exp(-1. * self.steps_done / self.EPS_DECAY) # calculate the threshold for exploration
        self.steps_done += 1
        if sample > eps_threshold: # if the random number is greater than the threshold, select the action with the highest Q-value
            with torch.no_grad():
                # t.max(1) will return the largest column value of each row.
                # the second column on max result is index of where max element was
                # found, so we pick action with the larger expected reward.
                return self.policy_net(state).max(1)[1].view(1, 1)
        else: # else, select a random action from the environment's action space
            return torch.tensor([[self.env.action_space.sample()]], device=self.device, dtype=torch.long)

    def optimize_model(self):
        """
        This function optimizes the Q-Network by performing backpropagation and updating the network's parameters.
        It relies on the global variables defined in the main function.

        Returns:
            None
        """
        # If there are not enough transitions stored in the memory buffer to form a minibatch, return without doing anything
        if len(self.memory) < self.BATCH_SIZE:
            return

        # Sample a minibatch of transitions from the memory buffer
        transitions = self.memory.sample(self.BATCH_SIZE)

        # Transpose the minibatch to create a batch of states, actions, rewards, and next_states
        batch = Transition(*zip(*transitions))

        # Compute a mask of non-final states and concatenate the batch elements
        non_final_mask = torch.tensor(tuple(map(lambda s: s is not None, batch.next_state)), device=self.device, dtype=torch.bool)
        non_final_next_states = torch.cat([s for s in batch.next_state if s is not None])
        state_batch = torch.cat(batch.state)
        action_batch = torch.cat(batch.action)
        reward_batch = torch.cat(batch.reward)

        # Compute Q(s_t, a) - the model computes Q(s_t), then we select the
        # columns of actions taken. These are the actions which would've been taken
        # for each batch state according to policy_net
        state_action_values = self.policy_net(state_batch).gather(1, action_batch) # current Q

        # Compute V(s_{t+1}) for all next states.
        # Expected values of actions for non_final_next_states are computed based
        # on the "older" target_net; selecting their best reward with max(1)[0].
        # This is merged based on the mask, such that we'll have either the expected
        # state value or 0 in case the state was final.
        next_state_values = torch.zeros(self.BATCH_SIZE, device=self.device)
        with torch.no_grad():
            next_state_values[non_final_mask] = self.target_net(non_final_next_states).max(1)[0]

        # Compute the expected Q values
        expected_state_action_values = (next_state_values * self.GAMMA) + reward_batch # r + dis * Q(s')

        # Compute the Huber loss between the current state-action values and the expected state-action values
        criterion = nn.SmoothL1Loss()
        loss = criterion(state_action_values, expected_state_action_values.unsqueeze(1))

        # Optimize the model
        self.optimizer.zero_grad()   # Set optimizer gradients
        loss.backward()
        # In-place gradient clipping
        torch.nn.utils.clip_grad_value_(self.policy_net.parameters(), 100)
        self.optimizer.step()

    def train(self):
        for i_episode in range(self.EPISODES):
            # Initialize the environment and get its state
            state, info = self.env.reset()
            state = torch.tensor(state, dtype=torch.float32, device=self.device).unsqueeze(0)

            for t in count():
                # Choose the next action using the current policy network
                action = self.select_action(state)

                # Take the action and observe the next state, reward, and termination signal
                observation, reward, terminated, truncated, _ = self.env.step(action.item())
                reward = torch.tensor([reward], device=self.device)
                done = terminated or truncated

                # Set the next state to None if the game is over, otherwise convert the observation to a tensor and unsqueeze it
                if done:
                    next_state = None
                else:
                    next_state = torch.tensor(observation, dtype=torch.float32, device=self.device).unsqueeze(0)

                # Store the transition in memory
                self.memory.push(state, action, next_state, reward)

                # Move to the next state
                state = next_state

                # Perform one step of the optimization on the policy network
                self.optimize_model()

                # Soft update of the target network's weights
                # θ′ ← τ θ + (1 −τ )θ′
                target_net_state_dict = self.target_net.state_dict()
                policy_net_state_dict = self.policy_net.state_dict()
                for key in policy_net_state_dict:
                    target_net_state_dict[key] = policy_net_state_dict[key] * self.TAU + target_net_state_dict[key] * (1 - self.TAU)
                self.target_net.load_state_dict(target_net_state_dict)

                if done:
                    # End the episode
                    break

    def save(self, path):
        torch.save(self.policy_net.state_dict(), path)

    def load(self, path):
        self.policy_net.load_state_dict(torch.load(path))
        self.target_net.load_state_dict(self.policy_net.state_dict())