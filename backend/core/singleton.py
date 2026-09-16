class Singleton:
    __instance = None

    def __new__(cls, *args, **kwargs):
        raise Exception('Конструктор приватный! Используйте метод get_instance().')

    @classmethod
    def get_instance(cls, *args, **kwargs):
        if cls.__instance is None:
            cls.__instance = object.__new__(cls)
            cls.__instance.__init__(*args, **kwargs)
        return cls.__instance
