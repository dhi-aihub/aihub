from .abc.evaluator import Evaluator, EvaluationResult


class RewardEvaluator(Evaluator):
    """Evaluates average reward across episodes."""

    def __init__(self):
        super().__init__()
        self.episodes = []

    def reset(self) -> None:
        self.episodes.append([])

    def step(self, full_state) -> None:
        self.episodes[-1].append(full_state["reward"])

    def get_result(self) -> EvaluationResult:
        total_reward_per_episode = [sum(r) for r in self.episodes]
        total_reward = sum(total_reward_per_episode)
        return EvaluationResult(
            name="reward evaluation",
            value=total_reward / len(self.episodes),
            results=total_reward_per_episode,
            error=self.error,
        )


class StepCountEvaluator(Evaluator):
    """Evaluates average number of steps across episodes."""

    def __init__(self):
        super().__init__()
        self.total_episodes = 0
        self.total_steps = 0

    def reset(self) -> None:
        self.total_episodes += 1

    def step(self, full_state) -> None:
        self.total_steps += 1

    def get_result(self) -> EvaluationResult:
        return EvaluationResult(
            name="step count evaluation (average survival steps)",
            value=self.total_steps / self.total_episodes,
            results={
                "total_episodes": self.total_episodes,
                "total_steps": self.total_steps,
            },
            error=self.error,
        )
