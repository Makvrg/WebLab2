import {Student} from "../entity/Student.js";
import {StorageRepository} from "../repository/StorageRepository.js";

export class FormView {

    form;
    onSubmitCallback;
    isEditMode = false;
    storageRepository;

    /**
     * @param {string} formSelector Селектор формы для работы с ней
     * @param {StorageRepository} storageRepository Синглтон репозитория
     * @param {Function} onSubmitCallback (student: Student, isEditMode: boolean) => void
     */
    constructor(formSelector, storageRepository, onSubmitCallback) {
        this.form = document.querySelector(formSelector);
        this.onSubmitCallback = onSubmitCallback;
        this.storageRepository = storageRepository

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
        this.form.addEventListener("submit", event => {
            event.preventDefault();

            const student = this.getStudentFromForm();
            if (!this.storageRepository.containsId(student.isuId)) {
                if (this.onSubmitCallback) {
                    this.onSubmitCallback(student, this.isEditMode);
                }
            } else {
                if (document.getElementById("isu")) {
                    document.getElementById("isu").value = "";
                }
                    alert("Студент с данным ИСУ уже существует")
            }
        }
        );
    }
}
