import os
import json
import atexit
from backend.core import Singleton
from backend.models import Student
from backend.exceptions import ServerException


class StudentRepository(Singleton):
    def __init__(self, filepath='backend/data.json'):
        if not hasattr(self, 'initialized'):
            self.filepath = filepath
            self._validate_storage_access()

            self._students: list[Student] = []

            self._load_from_file()
            self.initialized = True

            atexit.register(self.save_to_file)

    def _validate_storage_access(self) -> None:
        if os.path.exists(self.filepath):
            if not os.access(self.filepath, os.R_OK):
                raise PermissionError(f"Отказано в доступе: нет прав на чтение файла {self.filepath}")
            if not os.access(self.filepath, os.W_OK):
                raise PermissionError(f"Отказано в доступе: нет прав на запись в файл {self.filepath}")
        else:
            directory = os.path.dirname(self.filepath)
            if not directory:
                directory = "."

            if not os.path.exists(directory):
                raise FileNotFoundError(f"Директория для сохранения файла не существует: {directory}")
            if not os.access(directory, os.W_OK):
                raise PermissionError(f"Отказано в доступе: нет прав на создание файлов в директории {directory}")

    def _load_from_file(self) -> None:
        if not os.path.exists(self.filepath):
            self._students = []
            return

        try:
            with open(self.filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._students = [Student(**item) for item in data]
        except json.JSONDecodeError:
            self._students = []

    def save_to_file(self) -> None:
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                data = [student.to_dict() for student in self._students]
                json.dump(data, f, ensure_ascii=False, indent=4)
        except OSError as e:
            raise ServerException(f"Критическая ошибка сохранения данных на диск: {str(e)}")

    def get_by_isu(self, isu_id: int) -> Student | None:
        for student in self._students:
            if student.isuId == isu_id:
                return student
        return None

    def get_all(self) -> list[Student]:
        return self._students

    def add(self, student: Student) -> None:
        self._students.append(student)

    def update(self, updated_student: Student) -> bool:
        for i, student in enumerate(self._students):
            if student.isuId == updated_student.isuId:
                self._students[i] = updated_student
                return True
        return False

    def delete(self, isu_id: int) -> bool:
        initial_length = len(self._students)
        self._students = [s for s in self._students if s.isuId != isu_id]
        return len(self._students) < initial_length