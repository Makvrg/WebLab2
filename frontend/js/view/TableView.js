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
                <a href="form.html?id=${safeIsuId}" class="btn btn-small btn-primary">Изменить</a>
                <button class="btn btn-small btn-danger btn-delete">Удалить</button>
            `;

            tr.appendChild(actionsTd);
            this.tbody.appendChild(tr);
        });
    }

    #initEvents() {
        this.tbody.addEventListener("click", event => {
            if (event.target.classList.contains("btn-delete")) {
                const tr = event.target.closest("tr");
                if (tr && tr.dataset.isuId) {
                    this.onDeleteCallback(tr.dataset.isuId);
                }
            }
        }
        );
    }
}
