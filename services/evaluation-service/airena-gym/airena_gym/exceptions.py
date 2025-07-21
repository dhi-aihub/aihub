class UnexpectedStateError(Exception):
    def __init__(self, method: str, state: str):
        self.method = method
        self.state = state

    def __str__(self):
        return f"UnexpectedState at method <{self.method}>, state <{self.state}>"

    def __repr__(self):
        return self.__str__()


class UnexpectedMethodError(Exception):
    pass


class UnsupportedMethodError(Exception):
    pass
