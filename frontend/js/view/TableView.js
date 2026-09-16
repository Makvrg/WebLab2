export class TableView {

    tbody;
    onDeleteCallback;

    /**
     * @param {string} tbodySelector Селектор tbody для работы со строками таблицы
     * @param {Function} onDeleteCallback (isuId: string|number) => void
     */
    constructor(tbodySelector, onDeleteCallback) {
        this.tbody = document.querySelector(tbodySelector);
        this.onDeleteCallback = onDeleteCallback;

        if (this.tbody) {
            this.#initEvents();
        }
    }

    render(students) {
        if (!this.tbody) return;
        this.tbody.innerHTML = "";

        if (students.length === 0) {
            this.tbody.innerHTML =
                `<tr><td colspan="6" style="text-align: center;">Студентов пока нет</td></tr>`;
            return;
        }

        students.forEach(student => {
            const tr = document.createElement("tr");
            tr.dataset.isuId = student.isuId;

            const fields = [
                student.isuId,
                student.fio,
                student.stGroup,
                student.dormitoryNumber,
                student.room
            ];

            fields.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value ?? "";
                tr.appendChild(td);
            });

            const actionsTd = document.createElement("td");
            actionsTd.className = "actions";

            const safeIsuId = encodeURIComponent(student.isuId);

            actionsTd.innerHTML = `
                <a href="student.html?id=${safeIsuId}" class="btn btn-small">Просмотр</a>
                <a href="form.html?id=${safeIsuId}&mode=edit" class="btn btn-small btn-primary">Изменить</a>
                <button class="btn btn-small btn-danger btn-delete">Удалить</button>
            `;

            tr.appendChild(actionsTd);
            this.tbody.appendChild(tr);
        });
    }

    #getErrorMessage(error) {
        if (error?.code === "NETWORK_ERROR") {
            return "Не удалось связаться с сервером.";
        }

        return error?.message
            || ({
                400: "Некорректный запрос.",
                404: "Студент для удаления не найден.",
                409: "Операция конфликтует с текущими данными.",
                422: "Сервер отклонил данные операции.",
                500: "Ошибка со стороны сервера."
            }[error?.status] || "Произошла неизвестная ошибка.");
    }

    #showError(error) {
        let errorEl = document.getElementById("table-error");

        if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.id = "table-error";
            errorEl.className = "card";
            errorEl.setAttribute("role", "alert");
            errorEl.style.marginBottom = "20px";

            const tableContainer = document.querySelector(".table-responsive");

            if (tableContainer) {
                tableContainer.insertAdjacentElement("beforebegin", errorEl);
            } else {
                this.tbody.parentElement?.insertAdjacentElement(
                    "beforebegin",
                    errorEl
                );
            }
        }

        errorEl.textContent = this.#getErrorMessage(error);
        errorEl.hidden = false;

        if (error?.status === 500) {
            if (document.getElementById("add-btn")) {
                document.getElementById("add-btn").hidden = true;
            }

            if (document.getElementById("filter-btn")) {
                document.getElementById("filter-btn").hidden = true;
            }

            if (document.getElementById("table-body")) {
                document.getElementById("table-body").hidden = true;
            }

            if (document.querySelector("h1")) {
                document.querySelector("h1").textContent =
                    "Ошибка со стороны сервера";
            }
        }
    }

    #initEvents() {
        this.tbody.addEventListener("click", async event => {
            if (!event.target.classList.contains("btn-delete")) {
                return;
            }

            const tr = event.target.closest("tr");

            if (!tr || !tr.dataset.isuId) {
                return;
            }

            event.target.disabled = true;

            try {
                await this.onDeleteCallback(tr.dataset.isuId);

                const errorEl = document.getElementById("table-error");
                if (errorEl) {
                    errorEl.hidden = true;
                }
            } catch (error) {
                this.#showError(error);
            } finally {
                event.target.disabled = false;
            }
        });
    }
}
