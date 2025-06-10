import abc
import json
import logging
from enum import Enum

import zmq

from .env_serializer import EnvSerializer
from .exceptions import *
from .judge_env_base import JudgeEnvBase


class _State(Enum):
    """Multi-agent environment in aiVLE maintains a finite state machine (FSM)
    with the following states. Details about these states and transitions please
    refer to the documentation.
    https://pvzuww1vqx.larksuite.com/docs/docusSYdnLXZBojin39b8DGzKMT#StIDRG
    """

    INITIAL = 1
    WAIT_RESET = 2
    WAIT_ACTION = 3
    STEP = 4


class JudgeMultiEnv(JudgeEnvBase, metaclass=abc.ABCMeta):
    # Set this in SOME subclasses
    metadata = {"render.modes": []}
    spec = None

    def __init__(
            self,
            serializer: EnvSerializer,
            action_space,
            observation_space,
            #reward_range,
            n_agents,
            uid_to_idx,
            port=None,
    ):
        super().__init__(
            serializer, action_space, observation_space, port
        )
        self.socket = None
        assert isinstance(n_agents, int)
        assert n_agents >= 2  # use normal JudgeEnv for single-agent task
        self.n_agents = n_agents
        self.uid_to_idx = uid_to_idx

        self.can_reset = True
        self.state = _State.INITIAL

    def bind(self):
        context = zmq.Context()
        self.socket = context.socket(zmq.ROUTER)
        if self.port is not None and self.port != 0:
            self.socket.bind(f"tcp://*:{self.port}")
        else:
            self.port = self.socket.bind_to_random_port("tcp://*")
        return self.port

    def start(self):
        logging.info(f"[JudgeEnv] starting at {self.port}")
        # episode can be started only after all agents have called "reset"
        # all agents can call reset once at the beginning of each episode
        # episode is started by the first "reset" received by any one of the agents
        init_obs_n = None
        has_reset = [False for _ in range(self.n_agents)]
        reset_idx_to_rid = {}  # map from agent index to router ID
        # step is started by the first "step" received by any one of the agents
        # step is responded after all agents have stepped
        action_n = [None for _ in range(self.n_agents)]
        has_stepped = [False for _ in range(self.n_agents)]
        step_idx_to_rid = {}  # map from agent index to router ID

        while True:
            rid, delim, message = self.socket.recv_multipart()
            req = json.loads(message)
            method = req["method"]
            idx = self.uid_to_idx[req["uid"]]
            if method == "step":
                if self.state == _State.WAIT_ACTION:
                    if has_stepped[idx]:
                        raise Exception(
                            "this should not happen as agent socket is synchrounous..."
                        )  # TODO
                    has_stepped[idx] = True
                    step_idx_to_rid[idx] = rid
                    action_n[idx] = self.serializer.json_to_action(req["action"])
                    if not (
                            False in has_stepped
                    ):  # when all agents have taken an action, step in the underlying env
                        self.state = _State.STEP
                        obs_n, reward_n, done_n, info = self.step(action_n)
                        for i in range(self.n_agents):
                            resp = {
                                "observation": self.serializer.observation_to_json(
                                    obs_n[i]
                                ),
                                "reward": reward_n[i],
                                "done": done_n[i],
                                "info": self.serializer.info_to_json(info),
                            }
                            self.socket.send_multipart(
                                [
                                    step_idx_to_rid[i],
                                    delim,
                                    json.dumps(resp).encode("utf-8"),
                                ]
                            )
                        if not (False in done_n):
                            self.state = _State.INITIAL
                        else:
                            self.state = _State.WAIT_ACTION
                        action_n = [None for _ in range(self.n_agents)]
                        has_stepped = [False for _ in range(self.n_agents)]
                        step_idx_to_rid = {}
                else:
                    raise UnexpectedStateError("step", str(self.state))
            elif method == "reset":
                if self.state == _State.INITIAL:
                    self.state = _State.WAIT_RESET
                    init_obs_n = self.reset()
                    has_reset[idx] = True
                    reset_idx_to_rid[idx] = rid
                elif self.state == _State.WAIT_RESET:
                    if has_reset[idx]:  # immediately reject invalid request
                        self.socket.send_multipart(
                            [
                                rid,
                                delim,
                                json.dumps({"accepted": False}).encode("utf-8"),
                            ]
                        )
                    else:
                        has_reset[idx] = True
                        reset_idx_to_rid[idx] = rid
                        if not (False in has_reset):
                            # when all agents have called "reset", the episode is started
                            self.state = _State.WAIT_ACTION
                            # send initial observation to each agent at the same time
                            for i in range(self.n_agents):
                                self.socket.send_multipart(
                                    [
                                        reset_idx_to_rid[i],
                                        delim,
                                        json.dumps(
                                            {
                                                "accepted": True,
                                                "observation": self.serializer.observation_to_json(
                                                    init_obs_n[idx]
                                                ),
                                            }
                                        ).encode("utf-8"),
                                    ]
                                )
                            # cleanup
                            init_obs_n = None
                            has_reset = [False for _ in range(self.n_agents)]
                            reset_idx_to_rid = {}
                else:
                    raise UnexpectedStateError("reset", str(self.state))
            elif method == "render":
                logging.warning("render method is not supported in multi-agent judge")
                self.socket.send_multipart(
                    [
                        rid,
                        delim,
                        json.dumps(
                            {
                                "status": "failed",
                                "reason": "render not supported for multi-agent judge",
                            }
                        ),
                    ]
                )
                pass
            elif method == "seed":
                logging.warning("seed method is not supported in multi-agent judge")
                self.socket.send_multipart([rid, delim, b"ACK"])
                pass
            elif method == "close":
                self.socket.send_multipart([rid, delim, b"ACK"])
                pass
            else:
                raise UnexpectedMethodError(method)
            logging.debug(
                f"Received request from {req['uid']}: {json.loads(message)}, current state: {self.state}"
            )
