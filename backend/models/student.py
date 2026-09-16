from dataclasses import dataclass, asdict
from typing import Optional

@dataclass
class Student:
    isuId: int
    fio: str
    stGroup: str
    dormitoryNumber: int
    room: int
    dateOfPlacement: str
    isNotRussian: bool
    notes: Optional[str] = ''

    def to_dict(self) -> dict:
        return asdict(self)