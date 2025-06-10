import abc


class EnvSerializer(object):
    @abc.abstractmethod
    def action_to_json(self, action):
        """Transform action into serializable object (i.e. can be serailized using json.dump())

        :param action:
        :return action_json:
        """
        pass

    @abc.abstractmethod
    def json_to_action(self, action_json):
        """Transform serializable object into action native to Gym environment

        :param action_json:
        :return action_gym:
        """
        pass

    @abc.abstractmethod
    def observation_to_json(self, obs):
        """Transform observation into serializable object (i.e. can be serailized using json.dump())

        :param obs:
        :return obs_json:
        """
        pass

    @abc.abstractmethod
    def json_to_observation(self, obs_json):
        """Transform serializable object into observation native to Gym environment

        :param obs_json:
        :return obs_gym:
        """
        pass

    @abc.abstractmethod
    def info_to_json(self, info):
        """Transform info into serializable object (i.e. can be serailized using json.dump())

        :param info:
        :return info_json:
        """
        pass

    @abc.abstractmethod
    def json_to_info(self, info_json):
        """Transform serializable object into info native to Gym environment

        :param info_json:
        :return info_gym:
        """
        pass


class SampleSerializer(EnvSerializer):
    def action_to_json(self, action):
        return action

    def json_to_action(self, action_json):
        return action_json

    def observation_to_json(self, obs):
        return obs

    def json_to_observation(self, obs_json):
        return obs_json

    def info_to_json(self, info):
        return info

    def json_to_info(self, info_json):
        return info_json
