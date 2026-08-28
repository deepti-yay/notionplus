/* =========================================
   PAGE NAVIGATION
========================================= */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

function showPage(pageName) {

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    navItems.forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageName) {
            item.classList.add("active");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const page = item.dataset.page;

        if (page) {
            showPage(page);
        }

    });

});


/* =========================================
   QUICK BUTTONS
========================================= */

document.getElementById("openNotes").onclick = () => {
    showPage("notes");
};

document.getElementById("openTasks").onclick = () => {
    showPage("tasks");
};

document.getElementById("newPageButton").onclick = () => {
    showPage("notes");

    setTimeout(() => {
        document.getElementById("noteTitle").focus();
    }, 300);
};


/* =========================================
   NOTES
========================================= */

const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const noteStatus = document.getElementById("noteStatus");

function loadNote() {

    const savedTitle = localStorage.getItem("notionPlusTitle");
    const savedText = localStorage.getItem("notionPlusText");

    if (savedTitle) {
        noteTitle.value = savedTitle;
    }

    if (savedText) {
        noteText.value = savedText;
    }

}

loadNote();


document.getElementById("saveNote").onclick = () => {

    localStorage.setItem(
        "notionPlusTitle",
        noteTitle.value
    );

    localStorage.setItem(
        "notionPlusText",
        noteText.value
    );

    noteStatus.textContent = "✓ Note saved successfully";

    noteStatus.style.color = "#b8ffcc";

    setTimeout(() => {
        noteStatus.textContent = "";
    }, 2500);

};


/* =========================================
   TASK MANAGER
========================================= */

let tasks = JSON.parse(
    localStorage.getItem("notionPlusTasks")
) || [];

const taskList = document.getElementById("taskList");
const taskSummary = document.getElementById("taskSummary");


function saveTasks() {

    localStorage.setItem(
        "notionPlusTasks",
        JSON.stringify(tasks)
    );

}


function renderTasks() {

    taskList.innerHTML = "";

    const remaining = tasks.filter(
        task => !task.completed
    ).length;

    taskSummary.textContent =
        `${remaining} task${remaining === 1 ? "" : "s"} remaining`;


    tasks.forEach((task, index) => {

        const taskItem = document.createElement("div");

        taskItem.className = "task-item";

        taskItem.innerHTML = `

            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <span class="task-text ${
                task.completed ? "completed" : ""
            }">
                ${escapeHTML(task.text)}
            </span>

            <button class="delete-task">
                ×
            </button>

        `;


        const checkbox =
            taskItem.querySelector("input");

        checkbox.addEventListener(
            "change",
            () => {

                tasks[index].completed =
                    checkbox.checked;

                saveTasks();

                renderTasks();

            }
        );


        taskItem
            .querySelector(".delete-task")
            .addEventListener("click", () => {

                tasks.splice(index, 1);

                saveTasks();

                renderTasks();

            });


        taskList.appendChild(taskItem);

    });

}


document.getElementById("addTask").onclick =
    addTask;


document.getElementById("taskInput")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {
            addTask();
        }

    });


function addTask() {

    const input =
        document.getElementById("taskInput");

    const text = input.value.trim();

    if (!text) {
        return;
    }

    tasks.push({
        text: text,
        completed: false
    });

    input.value = "";

    saveTasks();

    renderTasks();

}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


renderTasks();


/* =========================================
   DECISION PICKER
========================================= */

const pickerModal =
    document.getElementById("pickerModal");

const pickerResult =
    document.getElementById("pickerResult");

const canvas =
    document.getElementById("wheel");

const ctx =
    canvas.getContext("2d");

let rotation = 0;

let spinning = false;


/* Open picker */

document.getElementById("openPicker").onclick =
    openPicker;

document.getElementById("pickerButton").onclick =
    openPicker;


function openPicker() {

    pickerModal.classList.add("show");

    drawWheel();

}


/* Close picker */

document.getElementById("closePicker").onclick =
    closePicker;


pickerModal.addEventListener("click", event => {

    if (event.target === pickerModal) {
        closePicker();
    }

});


function closePicker() {

    pickerModal.classList.remove("show");

}


/* Get choices */

function getChoices() {

    const inputs =
        document.querySelectorAll(".choice-input");

    return [...inputs]
        .map(input => input.value.trim())
        .filter(value => value.length > 0);

}


/* Draw wheel */

function drawWheel() {

    const choices = getChoices();

    const center = canvas.width / 2;

    const radius = 185;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (choices.length === 0) {

        ctx.beginPath();

        ctx.arc(
            center,
            center,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#777";

        ctx.fill();

        return;

    }


    const slice =
        (Math.PI * 2) / choices.length;


    choices.forEach((choice, index) => {

        const start =
            rotation +
            index * slice;

        const end =
            start + slice;


        ctx.beginPath();

        ctx.moveTo(center, center);

        ctx.arc(
            center,
            center,
            radius,
            start,
            end
        );

        ctx.closePath();


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );

        gradient.addColorStop(
            0,
            index % 2 === 0
                ? "#6574e8"
                : "#9b55d4"
        );

        gradient.addColorStop(
            1,
            index % 2 === 0
                ? "#4050bb"
                : "#7433aa"
        );

        ctx.fillStyle = gradient;

        ctx.fill();

        ctx.strokeStyle =
            "rgba(255,255,255,0.5)";

        ctx.lineWidth = 2;

        ctx.stroke();


        /* Text */

        ctx.save();

        ctx.translate(center, center);

        ctx.rotate(start + slice / 2);

        ctx.textAlign = "right";

        ctx.fillStyle = "white";

        ctx.font =
            "bold 15px Arial";

        let displayText = choice;

        if (displayText.length > 20) {
            displayText =
                displayText.substring(0, 20)
                + "...";
        }

        ctx.fillText(
            displayText,
            radius - 20,
            5
        );

        ctx.restore();

    });


    /* Center */

    ctx.beginPath();

    ctx.arc(
        center,
        center,
        30,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.9)";

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        center,
        center,
        12,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#222";

    ctx.fill();

}


/* Spin */

document.getElementById("spinWheel").onclick =
    spinWheel;


function spinWheel() {

    if (spinning) {
        return;
    }

    const choices = getChoices();

    if (choices.length < 2) {

        pickerResult.textContent =
            "Add at least 2 choices.";

        return;

    }


    spinning = true;

    pickerResult.textContent =
        "Spinning...";


    const winner =
        Math.floor(
            Math.random() * choices.length
        );


    const slice =
        (Math.PI * 2) / choices.length;


    /*
        Calculate rotation so that the
        selected slice reaches the pointer.
    */

    const target =
        Math.PI * 2 * 6
        -
        (
            winner * slice
            + slice / 2
        );


    const startRotation = rotation;

    const finalRotation =
        rotation + target;


    const duration = 4500;

    const startTime = performance.now();


    function animate(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        /* Smooth easing */

        const ease =
            1 -
            Math.pow(
                1 - progress,
                4
            );


        rotation =
            startRotation
            +
            (finalRotation - startRotation)
            * ease;


        drawWheel();


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        } else {

            spinning = false;

            pickerResult.innerHTML =
                `🎉 <strong>${escapeHTML(
                    choices[winner]
                )}</strong>`;

        }

    }


    requestAnimationFrame(animate);

}


/* Add choice */

document.getElementById("addChoice").onclick =
    () => {

        const container =
            document.getElementById(
                "choiceInputs"
            );

        const row =
            document.createElement("div");

        row.className =
            "choice-row";


        row.innerHTML = `

            <input
                type="text"
                class="choice-input"
                placeholder="New choice"
            >

            <button class="delete-choice">
                ×
            </button>

        `;


        container.appendChild(row);

        setupChoiceButtons();

        drawWheel();

    };


/* Delete choices */

function setupChoiceButtons() {

    document
        .querySelectorAll(".delete-choice")
        .forEach(button => {

            button.onclick = () => {

                const rows =
                    document.querySelectorAll(
                        ".choice-row"
                    );

                if (rows.length <= 2) {
                    return;
                }

                button.parentElement.remove();

                drawWheel();

            };

        });


    document
        .querySelectorAll(".choice-input")
        .forEach(input => {

            input.oninput =
                drawWheel;

        });

}


setupChoiceButtons();


/* =========================================
   SEARCH
========================================= */

const searchModal =
    document.getElementById("searchModal");

document.getElementById("searchButton").onclick =
    () => {

        searchModal.classList.add("show");

        document.getElementById(
            "searchInput"
        ).focus();

    };


document.getElementById("closeSearch").onclick =
    () => {

        searchModal.classList.remove("show");

    };


const searchData = [

    "Home",
    "Quick Notes",
    "Tasks",
    "Calendar",
    "Favorites",
    "My Study Notes",
    "Project Ideas",
    "Hackathon Project",
    "Decision Picker"

];


document.getElementById("searchInput")
    .addEventListener("input", event => {

        const value =
            event.target.value.toLowerCase();

        const results =
            searchData.filter(item =>
                item.toLowerCase()
                    .includes(value)
            );


        const container =
            document.getElementById(
                "searchResults"
            );

        container.innerHTML = "";


        results.forEach(result => {

            const div =
                document.createElement("div");

            div.className =
                "search-result";

            div.textContent = result;

            container.appendChild(div);

        });

    });


/* =========================================
   AI
========================================= */

const aiModal =
    document.getElementById("aiModal");

document.getElementById("aiButton").onclick =
    () => {

        aiModal.classList.add("show");

    };


document.getElementById("closeAI").onclick =
    () => {

        aiModal.classList.remove("show");

    };


/* =========================================
   CALENDAR
========================================= */

let calendarDate =
    new Date();


function renderCalendar() {

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    const monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    document.getElementById(
        "monthTitle"
    ).textContent =
        `${monthNames[month]} ${year}`;


    const grid =
        document.getElementById(
            "calendarGrid"
        );

    grid.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day empty";

        grid.appendChild(empty);

    }


    const today =
        new Date();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";

        cell.textContent = day;


        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {

            cell.classList.add("today");

        }


        cell.onclick = () => {

            alert(
                `You selected ${day} ${monthNames[month]} ${year}`
            );

        };


        grid.appendChild(cell);

    }

}


document.getElementById(
    "previousMonth"
).onclick = () => {

    calendarDate.setMonth(
        calendarDate.getMonth() - 1
    );

    renderCalendar();

};


document.getElementById(
    "nextMonth"
).onclick = () => {

    calendarDate.setMonth(
        calendarDate.getMonth() + 1
    );

    renderCalendar();

};


renderCalendar();


/* =========================================
   CURSOR REACTIVE TITLE
========================================= */

const cursorTitle =
    document.getElementById(
        "cursorTitle"
    );


document.addEventListener(
    "mousemove",
    event => {

        const x =
            (event.clientX /
                window.innerWidth -
                0.5) * 8;

        const y =
            (event.clientY /
                window.innerHeight -
                0.5) * 8;


        cursorTitle.style.transform =
            `translate(${x}px, ${y}px)`;

    }
);


/* =========================================
   ESCAPE TO CLOSE MODALS
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal-overlay"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

        }

    }
);