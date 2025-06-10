import logging
import multiprocessing
import time
from multiprocessing import Process

from example.multi_agent import PongAgentEnv
from example.multi_judge import PongJudgeEnv


def run_agent(uid, port):
    env = PongAgentEnv(uid=uid, port=port)
    for i_episode in range(2):
        env.reset()
        for t in range(10000):
            time.sleep(0.02)
            action = env.action_space.sample()
            observation, reward, done, info = env.step(action)
            if done:
                logging.info("Episode finished after {} timesteps".format(t + 1))
                break
        time.sleep(0.5)
    env.close()


def run_judge(return_queue):
    judge_env = PongJudgeEnv()
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
            agent_proc_0 = Process(target=run_agent, args=(0, port))
            agent_proc_1 = Process(target=run_agent, args=(1, port))
            agent_proc_0.start()
            agent_proc_1.start()
            agent_proc_0.join()
            agent_proc_1.join()
            judge_proc.kill()
            break
        else:
            time.sleep(1)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    main()
