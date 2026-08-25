const API_URL =
    "https://script.google.com/macros/s/AKfycbyInRshwcgOWIM3RhFGBdhHDCz8kJhwWCiyVR8Zu7-L3YORvk-ypxW7yoxwEtgYpTHy/exec?action=all";

let dashboardData = {
    students: [],
    tests: [],
    subtests: [],
    results: []
};


/* =========================================
   LOAD DATA
========================================= */

async function loadDashboardData() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API tidak dapat diakses.");
        }

        const json = await response.json();

        if (!json.success) {
            throw new Error(
                json.error || "API mengembalikan error."
            );
        }

        dashboardData = json.data;

        console.log("Dashboard data berhasil dimuat:", dashboardData);

        return dashboardData;

    } catch (error) {

        console.error("Gagal mengambil data:", error);

        showError(
            "Gagal memuat data dashboard: " +
            error.message
        );

        return null;
    }
}


/* =========================================
   HELPER
========================================= */

function getTKAResults(testId = "TKA001") {

    return dashboardData.results.filter(
        result => result.test_id === testId
    );
}


function getParticipants(testId = "TKA001") {

    const results = getTKAResults(testId);

    return [
        ...new Set(
            results.map(result => result.student_id)
        )
    ];
}


function getStudentMap() {

    const map = {};

    dashboardData.students.forEach(student => {

        map[student.student_id] = {
            ...student,
            scores: []
        };

    });

    return map;
}


/* =========================================
   STUDENT ANALYSIS
========================================= */

function calculateStudentAnalysis(
    testId = "TKA001"
) {

    const studentMap = getStudentMap();

    const results = getTKAResults(testId);

    results.forEach(result => {

        const student =
            studentMap[result.student_id];

        if (!student) return;

        const score = Number(result.nilai);

        if (!Number.isFinite(score)) return;

        student.scores.push({
            subtest_id: result.subtest_id,
            nilai: score
        });

    });


    return Object.values(studentMap)

        .filter(
            student => student.scores.length > 0
        )

        .map(student => {

            const values =
                student.scores.map(
                    score => score.nilai
                );

            const total =
                values.reduce(
                    (sum, value) => sum + value,
                    0
                );

            const average =
                total / values.length;

            return {
                ...student,

                total: total,

                average: average,

                count: values.length,

                highest: Math.max(...values),

                lowest: Math.min(...values)
            };

        })

        .sort(
            (a, b) => b.average - a.average
        );
}


/* =========================================
   OVERVIEW
========================================= */

function calculateOverview(
    testId = "TKA001"
) {

    const students =
        dashboardData.students;

    const results =
        getTKAResults(testId);

    const participants =
        getParticipants(testId);

    const scores =
        results

            .map(result => Number(result.nilai))

            .filter(
                score => Number.isFinite(score)
            );


    const average =
        scores.length
            ? scores.reduce(
                (sum, score) => sum + score,
                0
            ) / scores.length
            : 0;


    return {

        totalStudents:
            students.length,

        participants:
            participants.length,

        notParticipants:
            Math.max(
                students.length -
                participants.length,
                0
            ),

        average:
            average,

        highest:
            scores.length
                ? Math.max(...scores)
                : 0,

        lowest:
            scores.length
                ? Math.min(...scores)
                : 0,

        totalResults:
            scores.length
    };
}


/* =========================================
   STATUS
========================================= */

function getStudentStatus(average) {

    if (average < 500) {

        return {
            label: "INTERVENTION",
            className: "red"
        };

    }

    if (average < 600) {

        return {
            label: "WATCHLIST",
            className: "yellow"
        };

    }

    return {
        label: "ON TRACK",
        className: "green"
    };
}


/* =========================================
   RENDER OVERVIEW
========================================= */

function renderOverview(
    testId = "TKA001"
) {

    const overview =
        calculateOverview(testId);


    setText(
        "totalStudents",
        overview.totalStudents
    );

    setText(
        "participants",
        overview.participants
    );

    setText(
        "notParticipants",
        overview.notParticipants
    );

    setText(
        "averageScore",
        overview.average
            ? overview.average.toFixed(1)
            : "—"
    );


    const ranking =
        calculateStudentAnalysis(testId);

    renderRanking(ranking);

    renderIntervention(ranking);

    renderChart(ranking);
}


/* =========================================
   RANKING
========================================= */

function renderRanking(ranking) {

    const table =
        document.getElementById(
            "rankingTable"
        );

    if (!table) return;

    table.innerHTML = "";


    ranking
        .slice(0, 10)
        .forEach(
            (student, index) => {

                const status =
                    getStudentStatus(
                        student.average
                    );


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                student.nama
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            student.sekolah
                        )}
                    </td>

                    <td>
                        <strong>
                            ${student.average.toFixed(1)}
                        </strong>
                    </td>

                    <td>
                        ${student.count}
                    </td>

                    <td>
                        <span class="
                            status
                            ${status.className}
                        ">
                            ${status.label}
                        </span>
                    </td>

                `;

                table.appendChild(row);

            }
        );
}


/* =========================================
   INTERVENTION
========================================= */

function renderIntervention(ranking) {

    const container =
        document.getElementById(
            "intervention"
        );

    if (!container) return;

    container.innerHTML = "";


    const attention =
        ranking

            .filter(
                student =>
                    student.average < 600
            )

            .sort(
                (a, b) =>
                    a.average - b.average
            )

            .slice(0, 5);


    if (!attention.length) {

        container.innerHTML = `

            <div class="student">

                <div>
                    <div class="student-name">
                        Tidak ada siswa dalam watchlist.
                    </div>

                    <div class="student-subtitle">
                        Semua siswa berada di atas 600.
                    </div>
                </div>

                <span class="status green">
                    GOOD
                </span>

            </div>

        `;

        return;
    }


    attention.forEach(student => {

        const status =
            getStudentStatus(
                student.average
            );


        const div =
            document.createElement("div");

        div.className = "student";


        div.innerHTML = `

            <div>

                <div class="student-name">
                    ${escapeHTML(
                        student.nama
                    )}
                </div>

                <div class="student-subtitle">
                    Rata-rata:
                    ${student.average.toFixed(1)}
                </div>

            </div>

            <span class="
                status
                ${status.className}
            ">
                ${status.label}
            </span>

        `;


        container.appendChild(div);

    });
}


/* =========================================
   CHART
========================================= */

function renderChart(ranking) {

    const chart =
        document.getElementById(
            "chart"
        );

    if (!chart) return;

    chart.innerHTML = "";


    const top =
        ranking.slice(0, 6);


    if (!top.length) {

        chart.innerHTML =
            '<div class="loading">Belum ada data.</div>';

        return;
    }


    const maxScore =
        Math.max(
            ...top.map(
                student =>
                    student.average
            ),
            1
        );


    top.forEach(student => {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "bar-wrapper";


        const height =
            Math.max(
                (student.average /
                    maxScore) * 85,
                5
            );


        wrapper.innerHTML = `

            <div class="bar-value">
                ${student.average.toFixed(0)}
            </div>

            <div
                class="bar"
                style="height:${height}%"
            ></div>

            <div class="bar-label">
                ${escapeHTML(
                    getFirstName(
                        student.nama
                    )
                )}
            </div>

        `;


        chart.appendChild(wrapper);

    });
}


/* =========================================
   UTILITY
========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function getFirstName(name) {

    if (!name) return "";

    return name
        .trim()
        .split(/\s+/)[0];
}


function escapeHTML(value) {

    if (value === null ||
        value === undefined) {
        return "";
    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


function showError(message) {

    const box =
        document.getElementById(
            "errorBox"
        );

    if (!box) return;

    box.style.display = "block";

    box.textContent = message;
}


/* =========================================
   START
========================================= */

async function initDashboard() {

    const data =
        await loadDashboardData();

    if (!data) return;

    renderOverview("TKA001");
}


document.addEventListener(
    "DOMContentLoaded",
    initDashboard
);
