import {Controller} from "./controller/Controller.js";
import {TableView} from "./view/TableView.js";
import {FormView} from "./view/FormView.js";
import {ProfileView} from "./view/ProfileView.js";
import {Student} from "./entity/Student.js";

const ERROR_MESSAGES = {
    400: "Некорректный запрос. Проверьте введённые данные.",
    404: "Запрошенный студент не найден.",
    409: "Студент с таким ИСУ ID уже существует.",
    422: "Сервер отклонил данные. Проверьте значения полей.",
    500: "Ошибка со стороны сервера."
};

function getErrorMessage(error) {
    if (error?.code === "NETWORK_ERROR") {
        return "Не удалось связаться с сервером.";
    }

    const status = Number(error?.status);

    return ERROR_MESSAGES[status]
        || error?.message
        || "Произошла неизвестная ошибка";
}

function showPageError(error) {
    let errorEl = document.getElementById("page-error");

    if (!errorEl) {
        errorEl = document.createElement("div");
        errorEl.id = "page-error";
        errorEl.className = "card";
        errorEl.setAttribute("role", "alert");
        errorEl.style.marginBottom = "20px";

        const header = document.querySelector("header");

        if (header) {
            header.insertAdjacentElement("afterend", errorEl);
        } else {
            document.body.prepend(errorEl);
        }
    }

    errorEl.textContent = getErrorMessage(error);
    errorEl.hidden = false;

    return errorEl;
}

function hidePageError() {
    const errorEl = document.getElementById("page-error");

    if (errorEl) {
        errorEl.hidden = true;
    }
}

function hideElement(id) {
    const element = document.getElementById(id);

    if (element) {
        element.hidden = true;
    }
}

function handleServerError(error, options = {}) {
    const {hide = []} = options;

    showPageError(error);

    hide.forEach(hideElement);

    if (Number(error?.status) === 500) {
        const title = document.querySelector("h1");

        if (title) {
            title.textContent = "Ошибка со стороны сервера";
        }
    }
}

function getFiltersFromQuery() {
    const params = new URLSearchParams(window.location.search);

    const allowedFilters = [
        "isuId",
        "fio",
        "stGroup",
        "dormitoryNumber",
        "room",
        "dateOfPlacement",
        "isNotRussian"
    ];

    return Object.fromEntries(
        allowedFilters
            .filter(key => params.has(key) && params.get(key) !== "")
            .map(key => [key, params.get(key)])
    );
}

function getFilterQuery(student) {
    const values = {
        isuId: student.isuId,
        fio: student.fio,
        stGroup: student.stGroup,
        dormitoryNumber: student.dormitoryNumber,
        room: student.room,
        dateOfPlacement: student.dateOfPlacement
    };

    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
        }
    });

    params.set("isNotRussian", String(student.isNotRussian));

    return params;
}

document.addEventListener("DOMContentLoaded", async () => {
    const controller = Controller.getInstance();

    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");
    const requestedMode = urlParams.get("mode");

    // Страница списка.
    if (document.getElementById("students-table")) {
        const tableView = new TableView("#table-body", async isuId => {
            await controller.deleteStudent(isuId);

            const filters = getFiltersFromQuery();
            const students = await controller.getStudents(filters);

            tableView.render(
                students.map(Student.fromJSON)
            );
        });

        const filterBtn = document.getElementById("filter-btn");

        if (filterBtn) {
            filterBtn.addEventListener("click", event => {
                event.preventDefault();

                window.location.href = "form.html?mode=filter";
            });
        }

        try {
            hidePageError();

            const filters = getFiltersFromQuery();
            const students = await controller.getStudents(filters);

            tableView.render(
                students.map(Student.fromJSON)
            );
        } catch (error) {
            handleServerError(error, {
                hide: ["add-btn", "filter-btn", "students-table"]
            });
        }
    }

    // Страница формы.
    if (document.getElementById("student-form")) {
        const initialMode =
            requestedMode === "filter"
                ? "filter"
                : requestedMode === "edit"
                    ? "edit"
                    : "add";

        const formView = new FormView(
            "#student-form",
            async (student, mode) => {
                if (mode === "edit") {
                    await controller.updateStudent(
                        student.isuId,
                        student
                    );

                    window.location.href = "index.html";
                    return;
                }

                if (mode === "filter") {
                    const params = getFilterQuery(student);
                    const query = params.toString();

                    window.location.href = query
                        ? `index.html?${query}`
                        : "index.html";

                    return;
                }

                await controller.addStudent(student);

                window.location.href = "index.html";
            },
            initialMode
        );

        if (queryId) {
            try {
                const response =
                    await controller.getStudent(queryId);

                if (!response) {
                    throw {
                        status: 404
                    };
                }

                formView.fillForm(
                    Student.fromJSON(response)
                );
            } catch (error) {
                handleServerError(error, {
                    hide: ["student-form"]
                });
            }
        }
    }

    // Страница карточки студента.
    if (document.querySelector(".profile-card")) {
        const profileView = new ProfileView();

        try {
            const response =
                await controller.getStudent(queryId);

            if (!response) {
                throw {
                    status: 404
                };
            }

            profileView.render(
                Student.fromJSON(response)
            );
        } catch (error) {
            handleServerError(error, {
                hide: ["profile-card"]
            });
        }
    }
});
