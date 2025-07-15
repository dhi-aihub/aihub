import logging
import multiprocessing
import time
from multiprocessing import Process

from example.agent import CartPoleAgentEnv
from example.judge import CartPoleJudgeEnv


def run_agent(port):
    env = CartPoleAgentEnv(port=port)
    for i_episode in range(2):
        env.reset()
        for t in range(100):
            # time.sleep(0.1)
            action = env.action_space.sample()
            observation, reward, done, info = env.step(action)
            if done:
                logging.info("Episode finished after {} timesteps".format(t + 1))
                break
        time.sleep(2)
    env.close()


def run_judge(return_queue):
    judge_env = CartPoleJudgeEnv()
    return_queue.put(judge_env.bind())
    judge_env.start()


def main():
    manager = multiprocessing.Manager()
    return_queue = manager.Queue()
    judge_proc = Process(target=run_judge, args=(return_queue,))
    judge_proc.start()
    for _ in range(10):  # wait for up to 10 seconds
        if not return_queue.empty():
            port = return_queue.get()
            agent_proc = Process(target=run_agent, args=(port,))
            agent_proc.start()
            break
        else:
            time.sleep(1)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    main()
