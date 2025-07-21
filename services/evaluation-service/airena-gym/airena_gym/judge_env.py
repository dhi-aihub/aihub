import abc
import json
import logging

import zmq

from .env_serializer import EnvSerializer
from .judge_env_base import JudgeEnvBase


class JudgeEnv(JudgeEnvBase, metaclass=abc.ABCMeta):
    # Set this in SOME subclasses
    metadata = {"render.modes": []}
    spec = None

    def __init__(
            self,
            serializer: EnvSerializer,
            action_space,
            observation_space,
            #reward_range,
            port=None,
    ):
        super().__init__(
            serializer, action_space, observation_space, port
        )
        self.socket = None

    def bind(self):
        context = zmq.Context()
        self.socket = context.socket(zmq.REP)
        if self.port is not None and self.port != 0:
            self.socket.bind(f"tcp://*:{self.port}")
        else:
            self.port = self.socket.bind_to_random_port("tcp://*")
        return self.port

    def start(self):
        logging.info(f"[JudgeEnv] starting at {self.port}")
        while True:
            message = self.socket.recv_string()
            req = json.loads(message)
            method = req["method"]
            if method == "step":
                action = self.serializer.json_to_action(req["action"])
                obs, reward, terminated, truncated, info = self.step(action)
                resp = {
                    "observation": self.serializer.observation_to_json(obs),
                    "reward": reward,
                    "terminated": terminated,
                    "truncated": truncated,
                    "info": self.serializer.info_to_json(info),
                }
                self.socket.send_string(json.dumps(resp))
            elif method == "reset":
                obs, info = self.reset(seed=req.get("seed", None))
                self.socket.send_string(
                    json.dumps(
                        {
                            "accepted": True,
                            "observation": self.serializer.observation_to_json(obs),
                        }
                    )
                )
            elif method == "render":
                resp = self.render()
                self.socket.send_string(json.dumps({"resp": resp}))
            elif method == "close":
                self.close()
                self.socket.send_string("ACK")
                break  # TODO: validation of close request to avoid malicious close()
            else:
                logging.warning(
                    f"[JudgeEnv] unsupported method {method} from [uid: {req['uid']}]"
                )
                pass
            logging.debug(
                f"[JudgeEnv] request from {req['uid']}: {json.loads(message)}"
            )
