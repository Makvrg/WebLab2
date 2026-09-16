import {StorageRepository} from "./repository/StorageRepository.js";
import {TableView} from "./view/TableView.js";
import {FormView} from "./view/FormView.js";
import {ProfileView} from "./view/ProfileView.js";

document.addEventListener("DOMContentLoaded", () => {
    /** @type {StorageRepository} */
    const storageRepository = StorageRepository.getInstance();
    
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");

    // 1. Страница списка (index.html)
    if (document.getElementById("students-table")) {
        const tableView = new TableView("#table-body", isuId => {
            if (confirm("Вы уверены, что хотите удалить студента?")) {
                storageRepository.deleteStudent(isuId);
                tableView.render(storageRepository.readStudents());
            }
        }
        );
        tableView.render(storageRepository.readStudents());
    }

    // 2. Страница формы (form.html)
    if (document.getElementById("student-form")) {
        const formView = new FormView("#student-form", storageRepository,
            (student, isEditMode) => {
            if (isEditMode) {
                storageRepository.updateStudent(student);
            } else {
                storageRepository.addStudent(student);
            }
            window.location.href = "index.html";
        }
        );

        if (queryId) {
            const student = storageRepository.readStudents()
                .find(stud => Number(stud.isuId) === Number(queryId));
            if (student) {
                formView.fillForm(student);
            }
        }
    }

    // 3. Страница карточки студента (student.html)
    if (document.querySelector(".profile-card")) {
        const profileView = new ProfileView();
        const student = storageRepository.readStudents()
            .find(stud => Number(stud.isuId) === Number(queryId));
        if (student) {
            profileView.render(student);
        }
    }
}
);
