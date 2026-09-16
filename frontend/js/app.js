import {Controller} from "./controller/Controller.js";
import {TableView} from "./view/TableView.js";
import {FormView} from "./view/FormView.js";
import {ProfileView} from "./view/ProfileView.js";
import {Student} from "./entity/Student.js";

document.addEventListener("DOMContentLoaded", async () => {
    /** @type {Controller} */
    const controller = Controller.getInstance();
    
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");

    // 1. Страница списка (index.html)
    if (document.getElementById("students-table")) {
        const tableView = new TableView("#table-body", async isuId => {
            await controller.deleteStudent(isuId);
            tableView.render((await controller.getStudents()).map(Student.fromJSON));
        }
        );
        tableView.render((await controller.getStudents()).map(Student.fromJSON));
    }

    // 2. Страница формы (form.html)
    if (document.getElementById("student-form")) {
        const formView = new FormView("#student-form",
            async (student, isEditMode) => {
            if (isEditMode) {
                await controller.updateStudent(student.isuId, student);
            } else {
                await controller.addStudent(student);
            }
            window.location.href = "index.html";
        }
        );

        if (queryId) {
            const student = Student.fromJSON(await controller.getStudent(queryId));
            if (student) {
                formView.fillForm(student);
            }
        }
    }

    // 3. Страница карточки студента (student.html)
    if (document.querySelector(".profile-card")) {
        const profileView = new ProfileView();
        try {
            const student = Student.fromJSON(await controller.getStudent(queryId));
            if (student) {
            profileView.render(student);
            }
        } catch (error) {
            if (error.message === "NETWORK_ERROR") {
                    // TODO Как-то рассказать пользователю об ошибке
                } else if (error.status == 500) {
                    if (document.querySelector("card profile-card")) {
                        document.querySelector("card profile-card").hidden = true;
                    }
                    if (document.querySelector("btn")) {
                        document.querySelector("btn").hidden = true;
                    }
                    if (document.querySelector("h1")) {
                        document.querySelector("h1").textContent = "Ошибка со стороны сервера";
                    }
                }
        }
    }
}
);
