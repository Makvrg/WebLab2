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
        required_fields = ["isuId", "fio", "stGroup", "dormitoryNumber",
                           "room", "dateOfPlacement", "isNotRussian"]
        for field in required_fields:
            if field not in data or data[field] == "" or data[field] is None:
                raise ValidationException(f"Поле {field} обязательно для заполнения")

        if not re.fullmatch(r"[1-9]\d{5}", str(data["isuId"])):
            raise ValidationException("Некорректный формат ИСУ. Ожидается 6 цифр.")
        try:
            data["isuId"] = int(data["isuId"])
        except ValueError:
            raise ValidationException("Номер ИСУ должен быть числом.")

        fio = str(data["fio"]).strip()

        if len(fio) < 5 or len(fio) > 100:
            raise ValidationException("ФИО должно содержать минимум 5 символов и не более 100.")

        if not re.fullmatch(r"[^\W_]+(?: [^\W_]+)*", fio, re.UNICODE):
            raise ValidationException(
                "ФИО может содержать только буквы, цифры и пробелы."
            )

        if not any(char.isalpha() for char in fio):
            raise ValidationException(
                "ФИО должно содержать хотя бы одну букву."
            )
        if not re.fullmatch(r"[A-Z][34][1-4]\d{2}", str(data["stGroup"])):
            raise ValidationException("Некорректный формат группы.")

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

        if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])",
                            str(data["dateOfPlacement"])):
            raise ValidationException("Некорректный формат даты.")

        if not (str(data["isNotRussian"]).lower() in ["true", "false"]):
            raise ValidationException("Требуется True или False.")


    def get_students(self, filters: dict = None) -> list[dict]:
        students = self.repo.get_all()

        if filters:
            # 1. Поиск по ИСУ
            if filters.get("isuId"):
                students = [s for s in students if str(s.isuId) == str(filters["isuId"])]

            # 2. Поиск по ФИО
            if filters.get("fio"):
                fio_query = str(filters["fio"]).lower()
                students = [s for s in students if fio_query in s.fio.lower()]

            # 3. Фильтр по группе
            if filters.get("stGroup"):
                students = [s for s in students if s.stGroup == str(filters["stGroup"])]

            # 4. Фильтр по номеру общежития
            if filters.get("dormitoryNumber"):
                students = [s for s in students if str(s.dormitoryNumber) == str(filters["dormitoryNumber"])]

            # 5. Фильтр по номеру комнаты
            if filters.get("room"):
                students = [s for s in students if str(s.room) == str(filters["room"])]

            # 6. Фильтр по дате заселения (формат "YYYY-MM-DD")
            if filters.get("dateOfPlacement"):
                students = [s for s in students if s.dateOfPlacement == str(filters["dateOfPlacement"])]

            # 7. Фильтр по статусу иностранца
            if filters.get("isNotRussian"):
                is_foreigner = str(filters["isNotRussian"]).lower() == "true"
                students = [s for s in students if s.isNotRussian == is_foreigner]

        return [student.to_dict() for student in students]

    def get_student(self, isu_id: int) -> dict:
        student = self.repo.get_by_isu(isu_id)
        if not student:
            raise NotFoundException(f"Студент с ИСУ {isu_id} не найден.")
        return student.to_dict()

    def query_student(self, isu_id: int, query_data: dict) -> dict:
        student = self.get_student(isu_id)

        if not query_data:
            return student

        for key, expected_value in query_data.items():
            if key in student:
                real_value = student[key]

                if str(real_value).lower() != str(expected_value).lower():
                    raise NotFoundException(
                        f"Студент с ИСУ {isu_id} существует, но его поле '{key}' не равно '{expected_value}'"
                    )
            else:
                raise ValidationException(f"Поле '{key}' не существует для фильтрации")

        return student

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
