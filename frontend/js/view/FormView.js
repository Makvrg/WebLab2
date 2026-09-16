import {Student} from "../entity/Student.js";
import {Controller} from "../controller/Controller.js";

export class FormView {

    form;
    onSubmitCallback;
    isEditMode = false;

    /**
     * @param {string} formSelector Селектор формы для работы с ней
     * @param {Function} onSubmitCallback (student: Student, isEditMode: boolean) => void
     */
    constructor(formSelector, onSubmitCallback) {
        this.form = document.querySelector(formSelector);
        this.onSubmitCallback = onSubmitCallback;

        if (this.form) {
            this.#initEvents();
        }
    }

    getStudentFromForm() {
        const isuId = document.getElementById("isu")?.value || "";
        const fio = document.getElementById("fio")?.value || "";
        const group = document.getElementById("group")?.value || "";
        const dorm = document.getElementById("dorm")?.value || "";
        const room = document.getElementById("room")?.value || "";
        const date = document.getElementById("date")?.value || "";
        const foreigner = document.getElementById("foreigner")?.checked || false;
        const notes = document.getElementById("notes")?.value || "";

        return new Student(isuId, fio, group, dorm, room, date, foreigner, notes);
    }

    fillForm(student) {
        this.isEditMode = true;

        if (document.getElementById("isu")) {
            document.getElementById("isu").value = student.isuId;
            document.getElementById("isu").readOnly = true;
        }
        if (document.getElementById("fio")) {
            document.getElementById("fio").value = student.fio;
        }
        if (document.getElementById("group")) {
            document.getElementById("group").value = student.stGroup;
        }
        if (document.getElementById("dorm")) {
            document.getElementById("dorm").value = student.dormitoryNumber;
        }
        if (document.getElementById("room")) {
            document.getElementById("room").value = student.room || "";
        }
        if (document.getElementById("date")) {
            document.getElementById("date").value = student.dateOfPlacement;
        }
        if (document.getElementById("foreigner")) {
            document.getElementById("foreigner").checked = student.isNotRussian;
        }
        if (document.getElementById("notes")) {
            document.getElementById("notes").value = student.notes || "";
        }

        const titleEl = document.getElementById("form-title");
        const submitBtn = document.getElementById("submit-btn");

        if (titleEl) {
            titleEl.textContent = "Редактирование студента";
        }
        if (submitBtn) {
            submitBtn.textContent = "Сохранить изменения";
        }
    }

    #initEvents() {
        this.form.addEventListener("submit", async event => {
            event.preventDefault();

            const student = this.getStudentFromForm();
            try {
                if (this.onSubmitCallback) {
                    await this.onSubmitCallback(student, this.isEditMode);
                }
            } catch (error) {
                if (error.code === "NETWORK_ERROR") {
                    // TODO Как-то рассказать пользователю об ошибке
                } else if (error.status == 500) {
                    if (document.getElementById("student-form")) {
                        document.getElementById("student-form").hidden = true;
                    }
                    if (document.getElementById("form-title")) {
                        document.getElementById("form-title")
                            .textContent = "Ошибка со стороны сервера";
                    }
                }
            }
        }
        );
    }
}
