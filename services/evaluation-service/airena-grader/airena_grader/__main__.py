from .abc.exception import TestSuiteNotFound, AgentNotFound


def main():
    try:
        from my_test_suite import test_suite
    except ModuleNotFoundError as e:
        raise TestSuiteNotFound(e)
    try:
        from my_agent import create_agent
    except ModuleNotFoundError as e:
        raise AgentNotFound(e)
    result = test_suite.run(create_agent)
    print(result)


if __name__ == "__main__":
    main()
