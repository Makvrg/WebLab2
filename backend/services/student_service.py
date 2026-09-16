import re
from backend.core import Singleton
from backend.repositories import StudentRepository
from backend.models import Student
from backend.exceptions import (ValidationException, NotUniqueIdException,
                                NotFoundException)

class StudentService(Singleton):
    def __init__(self, repo: StudentRepository = None):
        if not hasattr(self, 'initialized') and repo is not None:
            self.repo = repo
            self.initialized = True

    def _validate_student_data(self, data: dict) -> None:
        required_fields = ["isuId", "fio", "stGroup",
                           "dormitoryNumber", "room", "dateOfPlacement"]
        for field in required_fields:
            if field not in data or data[field] == "" or data[field] is None:
                raise ValidationException(f"Поле {field} обязательно для заполнения")

        if not re.fullmatch(r"[1-9]\d{5}", str(data["isuId"])):
            raise ValidationException("Некорректный формат ИСУ. Ожидается 6 цифр.")
        try:
            data["isuId"] = int(data["isuId"])
        except ValueError:
            raise ValidationException("Номер ИСУ должен быть числом.")

        if not re.fullmatch(r"[A-Z][34][1-4]\d{2}", str(data["stGroup"])):
            raise ValidationException("Некорректный формат группы.")

        if len(str(data["fio"]).strip()) < 5:
            raise ValidationException("ФИО должно содержать минимум 5 символов.")

        try:
            data["dormitoryNumber"] = int(data["dormitoryNumber"])
            if not (1 <= data["dormitoryNumber"] <= 4):
                raise ValidationException("Номер общежития должен быть от 1 до 4.")
        except ValueError:
            raise ValidationException("Номер общежития должен быть числом.")

        try:
            data["room"] = int(data["room"])
            if not (100 <= data["room"] <= 2000):
                raise ValidationException("Номер комнаты должен быть от 100 до 2000.")
        except ValueError:
            raise ValidationException("Номер комнаты должен быть числом.")

    def get_students(self, filters: dict = None) -> list[dict]:
        students = self.repo.get_all()

        if filters:
            # 1. Поиск по ИСУ
            if filters.get("isuId") is not None:
                students = [s for s in students if str(s.isuId) == str(filters["isuId"])]

            # 2. Поиск по ФИО
            if filters.get("fio") is not None:
                fio_query = str(filters["fio"]).lower()
                students = [s for s in students if fio_query in s.fio.lower()]

            # 3. Фильтр по группе
            if filters.get("group") is not None:
                students = [s for s in students if s.stGroup == str(filters["group"])]

            # 4. Фильтр по номеру общежития
            if filters.get("dormitory") is not None:
                students = [s for s in students if str(s.dormitoryNumber) == str(filters["dormitory"])]

            # 5. Фильтр по номеру комнаты
            if filters.get("room") is not None:
                students = [s for s in students if str(s.room) == str(filters["room"])]

            # 6. Фильтр по дате заселения (формат "YYYY-MM-DD")
            if filters.get("date") is not None:
                students = [s for s in students if s.dateOfPlacement == str(filters["date"])]

            # 7. Фильтр по статусу иностранца
            if filters.get("foreigner") is not None:
                is_foreigner = str(filters["foreigner"]).lower() in ["true", "1", "yes"]
                students = [s for s in students if s.isNotRussian == is_foreigner]

        return [student.to_dict() for student in students]

    def get_student(self, isu_id: int) -> dict:
        student = self.repo.get_by_isu(isu_id)
        if not student:
            raise NotFoundException(f"Студент с ИСУ {isu_id} не найден.")
        return student.to_dict()

    def create_student(self, data: dict) -> dict:
        self._validate_student_data(data)

        if self.repo.get_by_isu(int(data["isuId"])):
            raise NotUniqueIdException()

        new_student = Student(**data)
        self.repo.add(new_student)
        return new_student.to_dict()

    def update_student(self, isu_id: int, data: dict) -> dict:
        data["isuId"] = isu_id
        self._validate_student_data(data)

        updated_student = Student(**data)

        if not self.repo.update(updated_student):
            raise NotFoundException(f"Студент с ИСУ {isu_id} не найден.")

        return updated_student.to_dict()

    def delete_student(self, isu_id: int) -> None:
        if not self.repo.delete(isu_id):
            raise NotFoundException(f"Студент с ИСУ {isu_id} не найден.")
