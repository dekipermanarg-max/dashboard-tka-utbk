const API_URL =
    "https://script.google.com/macros/s/AKfycbyInRshwcgOWIM3RhFGBdhHDCz8kJhwWCiyVR8Zu7-L3YORvk-ypxW7yoxwEtgYpTHy/exec?action=all";


let dashboardData = {
    students: [],
    tests: [],
    subtests: [],
    results: []
};


let currentTestId = "TKA001";

let currentStudentId = "";

let currentStudentTestId = "TKA001";


/* =========================================================
   LOAD DATA
========================================================= */

async function loadDashboardData() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "API tidak dapat diakses."
            );

        }


        const json =
            await response.json();


        if (!json.success) {

            throw new Error(
                json.error ||
                "API mengembalikan error."
            );

        }


        dashboardData =
            json.data;


        console.log(
            "Dashboard data:",
            dashboardData
        );


        populateTestSelectors();

        populateStudentSelector();


        renderOverview(
            currentTestId
        );


        renderTKA(
            currentTestId
        );


        if (
            dashboardData.students &&
            dashboardData.students.length
        ) {

            currentStudentId =
                dashboardData.students[0]
                    .student_id;


            document.getElementById(
                "studentSelector"
            ).value =
                currentStudentId;


            renderStudentDetail();

        }


    } catch (error) {

        console.error(
            "Gagal mengambil data:",
            error
        );


        showError(
            "Gagal memuat data dashboard: " +
            error.message
        );

    }

}


/* =========================================================
   TEST SELECTORS
========================================================= */

function getTests() {

    return (
        dashboardData.tests || []
    );

}


function getTKATests() {

    const tests =
        getTests();


    const filtered =
        tests.filter(
            test =>
                String(
                    test.jenis || ""
                ).toUpperCase()
                === "TKA"
                ||
                String(
                    test.test_id || ""
                ).toUpperCase()
                .startsWith("TKA")
        );


    return filtered.length
        ? filtered
        : [
            {
                test_id: "TKA001",
                nama: "TO TKA 1"
            }
        ];

}


function populateTestSelectors() {

    const selectors = [

        document.getElementById(
            "testSelector"
        ),

        document.getElementById(
            "tkaTestSelector"
        ),

        document.getElementById(
            "studentTestSelector"
        )

    ].filter(Boolean);


    selectors.forEach(
        selector => {

            selector.innerHTML = "";


            getTKATests().forEach(
                test => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        test.test_id;


                    option.textContent =
                        test.nama ||
                        test.name ||
                        test.test_id;


                    selector.appendChild(
                        option
                    );

                }
            );

        }
    );


    const overviewSelector =
        document.getElementById(
            "testSelector"
        );


    if (overviewSelector) {

        overviewSelector.value =
            currentTestId;

    }


    const tkaSelector =
        document.getElementById(
            "tkaTestSelector"
        );


    if (tkaSelector) {

        tkaSelector.value =
            currentTestId;

    }


    const studentTestSelector =
        document.getElementById(
            "studentTestSelector"
        );


    if (studentTestSelector) {

        studentTestSelector.value =
            currentStudentTestId;

    }

}


/* =========================================================
   STUDENT SELECTOR
========================================================= */

function populateStudentSelector() {

    const selector =
        document.getElementById(
            "studentSelector"
        );


    if (!selector) return;


    selector.innerHTML = "";


    (
        dashboardData.students || []
    )

    .sort(
        (
            a,
            b
        ) =>
            String(
                a.nama || ""
            ).localeCompare(
                String(
                    b.nama || ""
                )
            )
    )

    .forEach(
        student => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                student.student_id;


            option.textContent =
                student.nama;


            selector.appendChild(
                option
            );

        }
    );


    if (
        currentStudentId
    ) {

        selector.value =
            currentStudentId;

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function initSelectors() {

    const overviewSelector =
        document.getElementById(
            "testSelector"
        );


    if (overviewSelector) {

        overviewSelector.addEventListener(
            "change",
            function () {

                currentTestId =
                    this.value;


                renderOverview(
                    currentTestId
                );

            }
        );

    }


    const tkaSelector =
        document.getElementById(
            "tkaTestSelector"
        );


    if (tkaSelector) {

        tkaSelector.addEventListener(
            "change",
            function () {

                currentTestId =
                    this.value;


                renderTKA(
                    currentTestId
                );

            }
        );

    }


    const studentSelector =
        document.getElementById(
            "studentSelector"
        );


    if (studentSelector) {

        studentSelector.addEventListener(
            "change",
            function () {

                currentStudentId =
                    this.value;


                renderStudentDetail();

            }
        );

    }


    const studentTestSelector =
        document.getElementById(
            "studentTestSelector"
        );


    if (studentTestSelector) {

        studentTestSelector.addEventListener(
            "change",
            function () {

                currentStudentTestId =
                    this.value;


                renderStudentDetail();

            }
        );

    }

}


/* =========================================================
   RESULT HELPERS
========================================================= */

function getResults(
    testId
) {

    return (
        dashboardData.results || []
    ).filter(
        result =>
            result.test_id === testId
    );

}


function getStudentResults(
    studentId,
    testId
) {

    return getResults(
        testId
    ).filter(
        result =>
            result.student_id ===
            studentId
    );

}


function getParticipants(
    testId
) {

    return [
        ...new Set(
            getResults(
                testId
            )

            .map(
                result =>
                    result.student_id
            )
        )
    ];

}


/* =========================================================
   STUDENT MAP
========================================================= */

function getStudentMap() {

    const map = {};


    (
        dashboardData.students || []
    ).forEach(
        student => {

            map[
                student.student_id
            ] = {

                ...student,

                scores: []

            };

        }
    );


    return map;

}


/* =========================================================
   STUDENT ANALYSIS
========================================================= */

function calculateStudentAnalysis(
    testId
) {

    const studentMap =
        getStudentMap();


    const results =
        getResults(
            testId
        );


    results.forEach(
        result => {

            const student =
                studentMap[
                    result.student_id
                ];


            if (!student) return;


            const score =
                Number(
                    result.nilai
                );


            if (
                !Number.isFinite(
                    score
                )
            ) return;


            student.scores.push({

                subtest_id:
                    result.subtest_id,

                nilai:
                    score

            });

        }
    );


    return Object.values(
        studentMap
    )

    .filter(
        student =>
            student.scores.length > 0
    )

    .map(
        student => {

            const values =
                student.scores.map(
                    item =>
                        item.nilai
                );


            const total =
                values.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                );


            const average =
                total /
                values.length;


            return {

                ...student,

                total,

                average,

                count:
                    values.length,

                highest:
                    Math.max(
                        ...values
                    ),

                lowest:
                    Math.min(
                        ...values
                    )

            };

        }
    )

    .sort(
        (
            a,
            b
        ) =>
            b.average -
            a.average
    );

}


/* =========================================================
   OVERVIEW
========================================================= */

function calculateOverview(
    testId
) {

    const students =
        dashboardData.students || [];


    const ranking =
        calculateStudentAnalysis(
            testId
        );


    const participants =
        ranking.length;


    const studentAverages =
        ranking.map(
            student =>
                student.average
        );


    const average =
        studentAverages.length

            ? studentAverages.reduce(
                (
                    sum,
                    score
                ) =>
                    sum + score,
                0
            ) /
            studentAverages.length

            : 0;


    const allScores =
        getResults(
            testId
        )

        .map(
            result =>
                Number(
                    result.nilai
                )
        )

        .filter(
            score =>
                Number.isFinite(
                    score
                )
        );


    return {

        totalStudents:
            students.length,

        participants,

        notParticipants:
            Math.max(
                students.length -
                participants,
                0
            ),

        average,

        highest:
            allScores.length
                ? Math.max(
                    ...allScores
                )
                : 0,

        lowest:
            allScores.length
                ? Math.min(
                    ...allScores
                )
                : 0

    };

}


/* =========================================================
   STATUS
========================================================= */

function getStudentStatus(
    average
) {

    if (
        average < 500
    ) {

        return {

            label:
                "INTERVENTION",

            className:
                "red"

        };

    }


    if (
        average < 600
    ) {

        return {

            label:
                "WATCHLIST",

            className:
                "yellow"

        };

    }


    return {

        label:
            "ON TRACK",

        className:
            "green"

    };

}


/* =========================================================
   TEST NAME
========================================================= */

function getTestName(
    testId
) {

    const test =
        getTests().find(
            item =>
                item.test_id ===
                testId
        );


    return (
        test?.nama ||
        test?.name ||
        testId
    );

}


/* =========================================================
   OVERVIEW RENDER
========================================================= */

function renderOverview(
    testId
) {

    const overview =
        calculateOverview(
            testId
        );


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


    setText(
        "participantNote",
        getTestName(
            testId
        )
    );


    const ranking =
        calculateStudentAnalysis(
            testId
        );


    renderRanking(
        ranking
    );


    renderIntervention(
        ranking
    );


    renderChart(
        ranking
    );

}


/* =========================================================
   RANKING
========================================================= */

function renderRanking(
    ranking
) {

    const table =
        document.getElementById(
            "rankingTable"
        );


    if (!table) return;


    table.innerHTML = "";


    ranking
        .slice(
            0,
            10
        )
        .forEach(
            (
                student,
                index
            ) => {

                const status =
                    getStudentStatus(
                        student.average
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


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


                row.style.cursor =
                    "pointer";


                row.addEventListener(
                    "click",
                    () => {

                        openStudent(
                            student.student_id
                        );

                    }
                );


                table.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   OPEN STUDENT
========================================================= */

function openStudent(
    studentId
) {

    currentStudentId =
        studentId;


    currentStudentTestId =
        currentTestId;


    const studentSelector =
        document.getElementById(
            "studentSelector"
        );


    const studentTestSelector =
        document.getElementById(
            "studentTestSelector"
        );


    if (studentSelector) {

        studentSelector.value =
            studentId;

    }


    if (studentTestSelector) {

        studentTestSelector.value =
            currentTestId;

    }


    document
        .querySelectorAll(
            ".menu button"
        )

        .forEach(
            button =>
                button.classList
                    .remove(
                        "active"
                    )
        );


    const studentsButton =
        document.querySelector(
            '.menu button[data-page="students"]'
        );


    if (studentsButton) {

        studentsButton.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".page"
        )

        .forEach(
            page =>
                page.style.display =
                    "none"
        );


    const studentPage =
        document.getElementById(
            "page-students"
        );


    if (studentPage) {

        studentPage.style.display =
            "block";

    }


    renderStudentDetail();

}


/* =========================================================
   STUDENT DETAIL
========================================================= */

function renderStudentDetail() {

    const profile =
        document.getElementById(
            "studentProfile"
        );


    const scores =
        document.getElementById(
            "studentScores"
        );


    if (!profile || !scores) return;


    const student =
        (
            dashboardData.students || []
        ).find(
            item =>
                item.student_id ===
                currentStudentId
        );


    if (!student) {

        profile.innerHTML = `

            <div class="empty-state">
                Siswa tidak ditemukan.
            </div>

        `;


        scores.innerHTML = "";


        return;

    }


    const results =
        getStudentResults(
            currentStudentId,
            currentStudentTestId
        );


    const numericResults =
        results

        .map(
            result => ({
                ...result,
                nilai:
                    Number(
                        result.nilai
                    )
            })
        )

        .filter(
            result =>
                Number.isFinite(
                    result.nilai
                )
        );


    const values =
        numericResults.map(
            result =>
                result.nilai
        );


    const average =
        values.length
            ? values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            ) /
            values.length
            : 0;


    const highest =
        values.length
            ? Math.max(
                ...values
            )
            : 0;


    const lowest =
        values.length
            ? Math.min(
                ...values
            )
            : 0;


    const status =
        getStudentStatus(
            average
        );


    profile.innerHTML = `

        <div class="student-profile">

            <div>

                <div class="profile-name">
                    ${escapeHTML(
                        student.nama
                    )}
                </div>

                <div class="profile-info">

                    ${escapeHTML(
                        student.sekolah || "-"
                    )}

                    • 

                    ${escapeHTML(
                        student.kelas || "-"
                    )}

                    • 

                    ${escapeHTML(
                        student.rombel || "-"
                    )}

                </div>

            </div>


            <div class="profile-test">

                <div class="profile-test-name">
                    ${escapeHTML(
                        getTestName(
                            currentStudentTestId
                        )
                    )}
                </div>

                <span class="
                    status
                    ${status.className}
                ">
                    ${status.label}
                </span>

            </div>

        </div>


        <div class="profile-kpi-grid">

            <div>

                <div class="profile-kpi-label">
                    Rata-rata
                </div>

                <div class="profile-kpi-value">
                    ${
                        average
                            ? average.toFixed(1)
                            : "—"
                    }
                </div>

            </div>


            <div>

                <div class="profile-kpi-label">
                    Subtes
                </div>

                <div class="profile-kpi-value">
                    ${values.length}
                </div>

            </div>


            <div>

                <div class="profile-kpi-label">
                    Tertinggi
                </div>

                <div class="profile-kpi-value">
                    ${highest || "—"}
                </div>

            </div>


            <div>

                <div class="profile-kpi-label">
                    Terendah
                </div>

                <div class="profile-kpi-value">
                    ${lowest || "—"}
                </div>

            </div>

        </div>

    `;


    renderStudentScores(
        numericResults
    );

}


/* =========================================================
   SUBTEST GROUP
========================================================= */

function getSubtest(
    subtestId
) {

    return (
        dashboardData.subtests || []
    ).find(
        subtest =>
            subtest.subtest_id ===
            subtestId
    );

}


function isMandatoryTKA(
    subtestId
) {

    return [
        "TKA01",
        "TKA02",
        "TKA03"
    ].includes(
        subtestId
    );

}


/* =========================================================
   STUDENT SCORES
========================================================= */

function renderStudentScores(
    results
) {

    const container =
        document.getElementById(
            "studentScores"
        );


    if (!container) return;


    const mandatory =
        results.filter(
            result =>
                isMandatoryTKA(
                    result.subtest_id
                )
        );


    const optional =
        results.filter(
            result =>
                !isMandatoryTKA(
                    result.subtest_id
                )
        );


    container.innerHTML = `

        <div class="score-section">

            <div class="card">

                <div class="score-section-title">
                    📘 Mapel Wajib
                </div>

                <div class="score-grid">

                    ${
                        renderScoreCards(
                            mandatory
                        )
                    }

                </div>

            </div>

        </div>


        <br>


        <div class="score-section">

            <div class="card">

                <div class="score-section-title">
                    📚 Mapel Pilihan
                </div>

                ${
                    optional.length

                        ? `
                            <div class="score-grid">
                                ${
                                    renderScoreCards(
                                        optional
                                    )
                                }
                            </div>
                          `

                        : `
                            <div class="empty-score">
                                Siswa tidak mengikuti
                                mapel pilihan pada TO ini.
                            </div>
                          `
                }

            </div>

        </div>

    `;

}


/* =========================================================
   SCORE CARDS
   subtest_id sengaja TIDAK ditampilkan
========================================================= */

function renderScoreCards(
    results
) {

    if (!results.length) {

        return `

            <div class="empty-score">
                Belum ada nilai.
            </div>

        `;

    }


    return results

        .sort(
            (
                a,
                b
            ) =>
                a.subtest_id
                    .localeCompare(
                        b.subtest_id
                    )
        )

        .map(
            result => {

                const subtest =
                    getSubtest(
                        result.subtest_id
                    );


                const name =
                    subtest?.subtes ||
                    subtest?.nama ||
                    subtest?.name ||
                    result.subtest_id;


                const score =
                    Number(
                        result.nilai
                    );


                let scoreClass =
                    "green";


                if (
                    score < 500
                ) {

                    scoreClass =
                        "red";

                } else if (
                    score < 600
                ) {

                    scoreClass =
                        "yellow";

                }


                return `

                    <div class="score-card">

                        <div class="score-card-name">
                            ${escapeHTML(
                                name
                            )}
                        </div>

                        <div class="
                            score-card-value
                            ${scoreClass}
                        ">
                            ${score}
                        </div>

                    </div>

                `;

            }
        )

        .join("");

}


/* =========================================================
   TKA ANALYSIS
========================================================= */

function calculateTKASubjects(
    testId
) {

    const results =
        getResults(
            testId
        );


    const subjectMap = {};


    (
        dashboardData.subtests ||
        []
    )

    .filter(
        subtest =>
            String(
                subtest.jenis || ""
            ).toUpperCase()
            === "TKA"
            ||
            String(
                subtest.subtest_id || ""
            ).startsWith("TKA")
    )

    .forEach(
        subtest => {

            subjectMap[
                subtest.subtest_id
            ] = {

                id:
                    subtest.subtest_id,

                name:
                    subtest.subtes ||
                    subtest.nama ||
                    subtest.name ||
                    subtest.subtest_id,

                scores: []

            };

        }
    );


    results.forEach(
        result => {

            const subject =
                subjectMap[
                    result.subtest_id
                ];


            if (!subject) return;


            const score =
                Number(
                    result.nilai
                );


            if (
                Number.isFinite(
                    score
                )
            ) {

                subject.scores.push(
                    score
                );

            }

        }
    );


    return Object.values(
        subjectMap
    )

    .map(
        subject => {

            const scores =
                subject.scores;


            const average =
                scores.length

                    ? scores.reduce(
                        (
                            sum,
                            score
                        ) =>
                            sum + score,
                        0
                    ) /
                    scores.length

                    : 0;


            return {

                ...subject,

                average,

                participants:
                    scores.length,

                highest:
                    scores.length
                        ? Math.max(
                            ...scores
                        )
                        : 0,

                lowest:
                    scores.length
                        ? Math.min(
                            ...scores
                        )
                        : 0

            };

        }
    );

}


/* =========================================================
   TKA RENDER
========================================================= */

function renderTKA(
    testId
) {

    const ranking =
        calculateStudentAnalysis(
            testId
        );


    const overview =
        calculateOverview(
            testId
        );


    setText(
        "tkaParticipants",
        overview.participants
    );


    setText(
        "tkaAverage",
        overview.average
            ? overview.average.toFixed(1)
            : "—"
    );


    setText(
        "tkaHighest",
        overview.highest
            ? overview.highest
            : "—"
    );


    setText(
        "tkaLowest",
        overview.lowest
            ? overview.lowest
            : "—"
    );


    renderTKASubjects(
        testId
    );


    renderTKARanking(
        ranking
    );

}


/* =========================================================
   TKA SUBJECT CARDS
========================================================= */

function renderTKASubjects(
    testId
) {

    const container =
        document.getElementById(
            "tkaSubjectGrid"
        );


    if (!container) return;


    container.innerHTML = "";


    const subjects =
        calculateTKASubjects(
            testId
        );


    subjects.forEach(
        subject => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "subject-card";


            let scoreClass =
                "green";


            if (
                subject.average < 500
            ) {

                scoreClass =
                    "red";

            } else if (
                subject.average < 600
            ) {

                scoreClass =
                    "yellow";

            }


            card.innerHTML = `

                <div class="subject-name">
                    ${escapeHTML(
                        subject.name
                    )}
                </div>

                <div class="
                    subject-score
                    ${scoreClass}
                ">
                    ${
                        subject.participants
                            ? subject.average.toFixed(1)
                            : "—"
                    }
                </div>

                <div class="subject-meta">

                    ${subject.participants}
                    peserta

                    ${
                        subject.highest
                            ? " • Max " +
                              subject.highest
                            : ""
                    }

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   TKA RANKING
========================================================= */

function renderTKARanking(
    ranking
) {

    const table =
        document.getElementById(
            "tkaRankingTable"
        );


    if (!table) return;


    table.innerHTML = "";


    ranking.forEach(
        (
            student,
            index
        ) => {

            const status =
                getStudentStatus(
                    student.average
                );


            const row =
                document.createElement(
                    "tr"
                );


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


            row.style.cursor =
                "pointer";


            row.addEventListener(
                "click",
                () => {

                    openStudent(
                        student.student_id
                    );

                }
            );


            table.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   INTERVENTION
========================================================= */

function renderIntervention(
    ranking
) {

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
            (
                a,
                b
            ) =>
                a.average -
                b.average
        )

        .slice(
            0,
            5
        );


    if (!attention.length) {

        container.innerHTML = `

            <div class="student">

                <div>

                    <div class="student-name">
                        Tidak ada siswa
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


    attention.forEach(
        student => {

            const status =
                getStudentStatus(
                    student.average
                );


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "student";


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


            div.style.cursor =
                "pointer";


            div.addEventListener(
                "click",
                () => {

                    openStudent(
                        student.student_id
                    );

                }
            );


            container.appendChild(
                div
            );

        }
    );

}


/* =========================================================
   CHART
========================================================= */

function renderChart(
    ranking
) {

    const chart =
        document.getElementById(
            "chart"
        );


    if (!chart) return;


    chart.innerHTML = "";


    const top =
        ranking.slice(
            0,
            6
        );


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


    top.forEach(
        student => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "bar-wrapper";


            const height =
                Math.max(
                    (
                        student.average /
                        maxScore
                    ) * 85,
                    5
                );


            wrapper.innerHTML = `

                <div class="bar-value">
                    ${student.average.toFixed(0)}
                </div>

                <div
                    class="bar"
                    style="
                        height:${height}%;
                    "
                ></div>

                <div class="bar-label">
                    ${escapeHTML(
                        getFirstName(
                            student.nama
                        )
                    )}
                </div>

            `;


            chart.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    const buttons =
        document.querySelectorAll(
            ".menu button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;


                    buttons.forEach(
                        item =>
                            item.classList
                                .remove(
                                    "active"
                                )
                    );


                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".page"
                        )
                        .forEach(
                            section => {

                                section.style.display =
                                    "none";

                            }
                        );


                    const target =
                        document.getElementById(
                            "page-" +
                            page
                        );


                    if (target) {

                        target.style.display =
                            "block";

                    }


                    if (
                        page ===
                        "students"
                    ) {

                        renderStudentDetail();

                    }

                }
            );

        }
    );

}


/* =========================================================
   UTILITIES
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function getFirstName(
    name
) {

    if (!name) return "";


    return name
        .trim()
        .split(/\s+/)[0];

}


function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

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


function showError(
    message
) {

    const box =
        document.getElementById(
            "errorBox"
        );


    if (!box) return;


    box.style.display =
        "block";


    box.textContent =
        message;

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initDashboard() {

    initNavigation();

    initSelectors();

    await loadDashboardData();

}


document.addEventListener(
    "DOMContentLoaded",
    initDashboard
);
