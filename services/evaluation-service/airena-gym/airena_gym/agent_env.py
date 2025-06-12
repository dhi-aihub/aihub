import json
import logging
from typing import Tuple, Any

import gymnasium as gym
import zmq

from .env_serializer import EnvSerializer


class NotAllowedToReset(Exception):
    pass


class AgentEnv(gym.Env):
    # Set this in SOME subclasses
    metadata = {"render.modes": []}
    spec = None

    def __init__(
        self,
        serializer: EnvSerializer,
        action_space,
        observation_space,
        uid,
        port,
    ):
        self.uid = uid
        self.action_space = action_space
        self.observation_space = observation_space
        self.serializer = serializer
        self.port = port
        assert isinstance(port, int)
        assert isinstance(uid, int)
        context = zmq.Context()
        self.socket = context.socket(zmq.REQ)
        self.socket.connect(f"tcp://localhost:{self.port}")

    # def reset_socket(self):
    #     context = zmq.Context()
    #     self.socket = context.socket(zmq.REQ)
    #     self.socket.connect(f"tcp://localhost:{self.port}")

    def step(self, action):
        return self._remote_step(action)

    def reset(self, seed=None) -> Any:
        ok, obs = self._remote_reset(seed)
        if ok:
            return obs
        else:
            raise NotAllowedToReset

    def render(self) -> Any:
        return self._remote_render()

    def close(self) -> None:
        self._remote_close()

    def _remote_step(self, action) -> Tuple[Any, float, bool, bool, dict]:
        """Request remote to take an action

        Args:
            action (object): an action provided by the agent

        Returns: (observation, reward, terminated, truncated, info)
        """
        logging.debug(f"[AgentEnv {self.uid}| _remote_step] action: {action}")
        self.socket.send_string(
            json.dumps(
                {
                    "uid": self.uid,
                    "method": "step",
                    "action": self.serializer.action_to_json(action),
                }
            )
        )
        msg = self.socket.recv_string()
        obs, reward, terminated, truncated, info = self._json_to_ordi(json.loads(msg))
        logging.debug(
            f"[AgentEnv {self.uid}| _remote_step] response obs: {obs}, reward: {reward}, done: {terminated or truncated}, info: {info}"
        )
        return obs, reward, terminated, truncated, info

    def _remote_reset(self, seed) -> Tuple[bool, Any]:
        """Request remote to reset the environment

        Returns: (accepted, observation)
            accepted (bool): whether the reset request is accepted by the remote\n
            observation (object): if accepted, initial observation will be returned
        """
        logging.debug(f"[AgentEnv {self.uid}| _remote_reset] requesting, seed: {seed}")
        self.socket.send_string(json.dumps({"uid": self.uid, "method": "reset", "seed": seed}))
        msg = self.socket.recv_string()
        obj = json.loads(msg)
        logging.debug(f"[AgentEnv {self.uid}| _remote_reset] response: {obj}")
        if obj["accepted"]:
            return True, self.serializer.json_to_observation(obj["observation"])
        else:
            return False, None

    def _remote_render(self) -> Any:
        # logging.debug(f"[AgentEnv | _remote_render] requesting")
        self.socket.send_string(
            json.dumps({"uid": self.uid, "method": "render"})
        )
        msg = self.socket.recv_string()
        return json.loads(msg)

    def _remote_close(self) -> None:
        logging.debug(f"[AgentEnv {self.uid}| _remote_close] requesting")
        self.socket.send_string(json.dumps({"uid": self.uid, "method": "close"}))
        _ = self.socket.recv_string()

    def _json_to_ordi(self, ordi_json) -> Tuple[Any, float, bool, bool, dict]:
        obs = ordi_json["observation"]
        reward = ordi_json["reward"]
        terminated = ordi_json["terminated"]
        truncated = ordi_json["truncated"]
        info = ordi_json["info"]
        return (
            self.serializer.json_to_observation(obs),
            reward,
            terminated,
            truncated,
            self.serializer.json_to_info(info),
        )
