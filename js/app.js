/* =========================================================
   STUDENT ANALYTICS
   TKA & UTBK
   ========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyInRshwcgOWIM3RhFGBdhHDCz8kJhwWCiyVR8Zu7-L3YORvk-ypxW7yoxwEtgYpTHy/exec?action=all";


/* =========================================================
   GLOBAL DATA
========================================================= */

let dashboardData = {
    students: [],
    tests: [],
    subtests: [],
    results: []
};


let currentTestId = "";
let currentStudentId = "";
let currentStudentTestId = "";
let currentDetailTestId = "";

let detailSearchKeyword = "";


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initNavigation();

        initSelectors();

        initDetailSearch();

        initPrint();

        await loadDashboardData();

    }
);


/* =========================================================
   LOAD DATA FROM APPS SCRIPT
========================================================= */

async function loadDashboardData() {

    try {

        showLoadingState();


        const response =
            await fetch(
                API_URL,
                {
                    cache: "no-store"
                }
            );


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


        dashboardData = {

            students:
                Array.isArray(
                    json.data?.students
                )
                    ? json.data.students
                    : [],

            tests:
                Array.isArray(
                    json.data?.tests
                )
                    ? json.data.tests
                    : [],

            subtests:
                Array.isArray(
                    json.data?.subtests
                )
                    ? json.data.subtests
                    : [],

            results:
                Array.isArray(
                    json.data?.results
                )
                    ? json.data.results
                    : []

        };


        console.log(
            "Dashboard data loaded:",
            dashboardData
        );


        prepareInitialSelections();

        populateAllSelectors();

        renderAll();


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showError(
            "Gagal memuat data dashboard: " +
            error.message
        );

    }

}


/* =========================================================
   INITIAL SELECTIONS
========================================================= */

function prepareInitialSelections() {

    const tests =
        getTests();


    if (!tests.length) {

        currentTestId = "TKA001";
        currentStudentTestId = "TKA001";
        currentDetailTestId = "TKA001";

    } else {

        const tkaTests =
            getTKATests();


        const firstTKA =
            tkaTests[0] ||
            tests[0];


        currentTestId =
            firstTKA.test_id;


        currentStudentTestId =
            firstTKA.test_id;


        currentDetailTestId =
            firstTKA.test_id;

    }


    if (
        dashboardData.students.length
    ) {

        currentStudentId =
            dashboardData.students[0]
                .student_id;

    }

}


/* =========================================================
   TEST HELPERS
========================================================= */

function getTests() {

    return (
        dashboardData.tests || []
    );

}


function getTestId(test) {

    return (
        test?.test_id ||
        test?.id ||
        ""
    );

}


function getTestName(testOrId) {

    if (
        typeof testOrId === "object"
    ) {

        return (
            testOrId.nama ||
            testOrId.name ||
            testOrId.test_name ||
            testOrId.test_id ||
            "Tanpa nama"
        );

    }


    const test =
        getTests().find(
            item =>
                getTestId(item) ===
                testOrId
        );


    return (
        test?.nama ||
        test?.name ||
        test?.test_name ||
        test?.test_id ||
        testOrId ||
        "Tanpa nama"
    );

}


function getTestJenis(test) {

    return String(
        test?.jenis ||
        test?.type ||
        test?.kategori ||
        ""
    ).toUpperCase();

}


function isTKA(test) {

    const id =
        String(
            getTestId(test)
        ).toUpperCase();


    const jenis =
        getTestJenis(test);


    return (
        jenis === "TKA" ||
        id.startsWith("TKA")
    );

}


function isUTBK(test) {

    const id =
        String(
            getTestId(test)
        ).toUpperCase();


    const jenis =
        getTestJenis(test);


    return (
        jenis === "UTBK" ||
        id.startsWith("UTBK")
    );

}


function getTKATests() {

    return getTests()
        .filter(
            test =>
                isTKA(test)
        );

}


function getUTBKTests() {

    return getTests()
        .filter(
            test =>
                isUTBK(test)
        );

}


/* =========================================================
   SUBTEST HELPERS
========================================================= */

function getSubtest(
    subtestId
) {

    return (
        dashboardData.subtests || []
    ).find(
        item =>
            String(
                item.subtest_id
            ) ===
            String(
                subtestId
            )
    );

}


function getSubtestName(
    subtestId
) {

    const subtest =
        getSubtest(
            subtestId
        );


    return (
        subtest?.subtes ||
        subtest?.nama ||
        subtest?.name ||
        subtest?.subject ||
        subtestId
    );

}


function getSubtestJenis(
    subtest
) {

    return String(
        subtest?.jenis ||
        subtest?.type ||
        ""
    ).toUpperCase();

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
            String(
                result.test_id
            ) ===
            String(
                testId
            )
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
            String(
                result.student_id
            ) ===
            String(
                studentId
            )
    );

}


function getScore(
    result
) {

    const value =
        Number(
            result?.nilai
        );


    return Number.isFinite(
        value
    )
        ? value
        : null;

}


/* =========================================================
   STUDENT HELPERS
========================================================= */

function getStudent(
    studentId
) {

    return (
        dashboardData.students || []
    ).find(
        student =>
            String(
                student.student_id
            ) ===
            String(
                studentId
            )
    );

}


function getStudentName(
    studentId
) {

    const student =
        getStudent(
            studentId
        );


    return (
        student?.nama ||
        studentId
    );

}


/* =========================================================
   PARTICIPANTS
========================================================= */

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
   STUDENT ANALYSIS
========================================================= */

function calculateStudentAnalysis(
    testId
) {

    const students =
        dashboardData.students || [];


    const results =
        getResults(
            testId
        );


    const map = {};


    students.forEach(
        student => {

            map[
                student.student_id
            ] = {

                ...student,

                scores: []

            };

        }
    );


    results.forEach(
        result => {

            const student =
                map[
                    result.student_id
                ];


            if (!student) return;


            const score =
                getScore(
                    result
                );


            if (
                score === null
            ) return;


            student.scores.push(
                score
            );

        }
    );


    return Object.values(
        map
    )

    .filter(
        student =>
            student.scores.length > 0
    )

    .map(
        student => {

            const scores =
                student.scores;


            const total =
                scores.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                );


            return {

                ...student,

                count:
                    scores.length,

                total,

                average:
                    total /
                    scores.length,

                highest:
                    Math.max(
                        ...scores
                    ),

                lowest:
                    Math.min(
                        ...scores
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
   OVERVIEW CALCULATION
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


    const scores =
        getResults(
            testId
        )

        .map(
            result =>
                getScore(
                    result
                )
        )

        .filter(
            score =>
                score !== null
        );


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

        totalStudents:
            students.length,

        participants:
            ranking.length,

        notParticipants:
            Math.max(
                students.length -
                ranking.length,
                0
            ),

        average,

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


/* =========================================================
   POPULATE ALL SELECTORS
========================================================= */

function populateAllSelectors() {

    populateTestSelector(
        "testSelector",
        getTests(),
        currentTestId
    );


    populateTestSelector(
        "tkaTestSelector",
        getTKATests(),
        currentTestId
    );


    populateTestSelector(
        "utbkTestSelector",
        getUTBKTests(),
        getUTBKTests()[0]?.test_id || ""
    );


    populateTestSelector(
        "detailTestSelector",
        getTests(),
        currentDetailTestId
    );


    populateTestSelector(
        "rankingTestSelector",
        getTests(),
        currentTestId
    );


    populateTestSelector(
        "interventionTestSelector",
        getTests(),
        currentTestId
    );


    populateTestSelector(
        "studentTestSelector",
        getTests(),
        currentStudentTestId
    );


    populateStudentSelector();

}


function populateTestSelector(
    elementId,
    tests,
    selectedId
) {

    const selector =
        document.getElementById(
            elementId
        );


    if (!selector) return;


    selector.innerHTML = "";


    if (!tests.length) {

        const option =
            document.createElement(
                "option"
            );


        option.value = "";

        option.textContent =
            "Belum ada data";


        selector.appendChild(
            option
        );


        return;

    }


    tests.forEach(
        test => {

            const option =
                document.createElement(
                    "option"
                );


            const id =
                getTestId(
                    test
                );


            option.value =
                id;


            option.textContent =
                getTestName(
                    test
                );


            if (
                id ===
                selectedId
            ) {

                option.selected =
                    true;

            }


            selector.appendChild(
                option
            );

        }
    );

}


function populateStudentSelector() {

    const selector =
        document.getElementById(
            "studentSelector"
        );


    if (!selector) return;


    selector.innerHTML = "";


    const students =
        [
            ...(
                dashboardData.students ||
                []
            )
        ]

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
        );


    students.forEach(
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
   SELECTOR EVENTS
========================================================= */

function initSelectors() {

    const testSelector =
        document.getElementById(
            "testSelector"
        );


    if (testSelector) {

        testSelector.addEventListener(
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


    const utbkSelector =
        document.getElementById(
            "utbkTestSelector"
        );


    if (utbkSelector) {

        utbkSelector.addEventListener(
            "change",
            function () {

                renderUTBK(
                    this.value
                );

            }
        );

    }


    const detailSelector =
        document.getElementById(
            "detailTestSelector"
        );


    if (detailSelector) {

        detailSelector.addEventListener(
            "change",
            function () {

                currentDetailTestId =
                    this.value;


                renderDetailTO(
                    currentDetailTestId
                );

            }
        );

    }


    const rankingSelector =
        document.getElementById(
            "rankingTestSelector"
        );


    if (rankingSelector) {

        rankingSelector.addEventListener(
            "change",
            function () {

                renderRankingPage(
                    this.value
                );

            }
        );

    }


    const interventionSelector =
        document.getElementById(
            "interventionTestSelector"
        );


    if (interventionSelector) {

        interventionSelector.addEventListener(
            "change",
            function () {

                renderInterventionPage(
                    this.value
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
                function () {

                    const page =
                        this.dataset.page;


                    buttons.forEach(
                        item =>
                            item.classList
                                .remove(
                                    "active"
                                )
                    );


                    this.classList.add(
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


                    switch (page) {

                        case "overview":

                            renderOverview(
                                currentTestId
                            );

                            break;


                        case "tka":

                            renderTKA(
                                currentTestId
                            );

                            break;


                        case "utbk":

                            renderUTBK(
                                document
                                    .getElementById(
                                        "utbkTestSelector"
                                    )
                                    ?.value
                            );

                            break;


                        case "detail":

                            renderDetailTO(
                                currentDetailTestId
                            );

                            break;


                        case "students":

                            renderStudentDetail();

                            break;


                        case "ranking":

                            renderRankingPage(
                                document
                                    .getElementById(
                                        "rankingTestSelector"
                                    )
                                    ?.value
                            );

                            break;


                        case "intervention-page":

                            renderInterventionPage(
                                document
                                    .getElementById(
                                        "interventionTestSelector"
                                    )
                                    ?.value
                            );

                            break;

                    }

                }
            );

        }
    );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderOverview(
        currentTestId
    );


    renderTKA(
        currentTestId
    );


    renderUTBK(
        getUTBKTests()[0]?.test_id ||
        ""
    );


    renderDetailTO(
        currentDetailTestId
    );


    renderStudentDetail();


    renderRankingPage(
        currentTestId
    );


    renderInterventionPage(
        currentTestId
    );

}


/* =========================================================
   OVERVIEW
========================================================= */

function renderOverview(
    testId
) {

    if (!testId) return;


    const data =
        calculateOverview(
            testId
        );


    setText(
        "totalStudents",
        data.totalStudents
    );


    setText(
        "participants",
        data.participants
    );


    setText(
        "notParticipants",
        data.notParticipants
    );


    setText(
        "averageScore",
        data.average
            ? data.average.toFixed(1)
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


    renderChart(
        ranking
    );


    renderIntervention(
        ranking
    );


    renderRankingTable(
        ranking,
        "rankingTable"
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

        chart.innerHTML = `
            <div class="loading">
                Belum ada data.
            </div>
        `;

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


            wrapper.style.cursor =
                "pointer";


            wrapper.addEventListener(
                "click",
                function () {

                    openStudent(
                        student.student_id
                    );

                }
            );


            chart.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   OVERVIEW INTERVENTION
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


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "student";


            item.style.cursor =
                "pointer";


            item.innerHTML = `

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


            item.addEventListener(
                "click",
                function () {

                    openStudent(
                        student.student_id
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   GENERIC RANKING TABLE
========================================================= */

function renderRankingTable(
    ranking,
    elementId
) {

    const table =
        document.getElementById(
            elementId
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
                        student.sekolah ||
                        "—"
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
                function () {

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
   TKA
========================================================= */

function renderTKA(
    testId
) {

    if (!testId) return;


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
        overview.highest || "—"
    );


    setText(
        "tkaLowest",
        overview.lowest || "—"
    );


    renderTKASubjects(
        testId
    );


    renderRankingTable(
        calculateStudentAnalysis(
            testId
        ),
        "tkaRankingTable"
    );

}


/* =========================================================
   TKA SUBTEST ANALYSIS
========================================================= */

function calculateTKASubjects(
    testId
) {

    const results =
        getResults(
            testId
        );


    const map = {};


    results.forEach(
        result => {

            const id =
                result.subtest_id;


            if (!id) return;


            if (!map[id]) {

                map[id] = {

                    id,

                    name:
                        getSubtestName(
                            id
                        ),

                    scores: []

                };

            }


            const score =
                getScore(
                    result
                );


            if (
                score !== null
            ) {

                map[id]
                    .scores
                    .push(
                        score
                    );

            }

        }
    );


    return Object.values(
        map
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

                participants:
                    scores.length,

                average,

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
    )

    .sort(
        (
            a,
            b
        ) =>
            a.id.localeCompare(
                b.id
            )
    );

}


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


    if (!subjects.length) {

        container.innerHTML = `

            <div class="empty-score">
                Belum ada data subtes.
            </div>

        `;

        return;

    }


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

                    ${
                        subject.participants
                    }
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
   UTBK
========================================================= */

function renderUTBK(
    testId
) {

    const page =
        document.getElementById(
            "page-utbk"
        );


    if (!page) return;


    const tests =
        getUTBKTests();


    if (!tests.length) {

        return;

    }


    if (!testId) {

        testId =
            tests[0].test_id;

    }


    const results =
        getResults(
            testId
        );


    const participants =
        getParticipants(
            testId
        ).length;


    const scores =
        results

        .map(
            result =>
                getScore(
                    result
                )
        )

        .filter(
            score =>
                score !== null
        );


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


    /*
       UTBK page sementara menggunakan
       placeholder dari HTML.
       Struktur ini sengaja disiapkan
       untuk pengembangan analisis UTBK
       berikutnya.
    */


    console.log(
        "UTBK:",
        {
            testId,
            participants,
            average,
            scores
        }
    );

}


/* =========================================================
   DETAIL TO
========================================================= */

function renderDetailTO(
    testId
) {

    const head =
        document.getElementById(
            "detailTableHead"
        );


    const body =
        document.getElementById(
            "detailTableBody"
        );


    const title =
        document.getElementById(
            "detailTestTitle"
        );


    if (
        !head ||
        !body
    ) return;


    currentDetailTestId =
        testId;


    if (title) {

        title.textContent =
            getTestName(
                testId
            );

    }


    head.innerHTML = "";

    body.innerHTML = "";


    if (!testId) {

        body.innerHTML = `

            <tr>

                <td colspan="3">
                    Belum ada tes.
                </td>

            </tr>

        `;

        return;

    }


    const results =
        getResults(
            testId
        );


    const subtestIds =
        getOrderedSubtestIds(
            testId,
            results
        );


    /*
       HEADER
    */

    const headerRow =
        document.createElement(
            "tr"
        );


    const noHeader =
        document.createElement(
            "th"
        );


    noHeader.textContent =
        "No.";


    headerRow.appendChild(
        noHeader
    );


    const nameHeader =
        document.createElement(
            "th"
        );


    nameHeader.textContent =
        "Nama Siswa";


    headerRow.appendChild(
        nameHeader
    );


    subtestIds.forEach(
        subtestId => {

            const th =
                document.createElement(
                    "th"
                );


            /*
               TIDAK MENAMPILKAN
               subtest_id.
               Yang tampil hanya
               nama mapel/subtes.
            */

            th.textContent =
                getSubtestName(
                    subtestId
                );


            headerRow.appendChild(
                th
            );

        }
    );


    head.appendChild(
        headerRow
    );


    /*
       BUAT MAP NILAI
       student_id -> subtest_id -> nilai
    */

    const scoreMap = {};


    results.forEach(
        result => {

            if (
                !scoreMap[
                    result.student_id
                ]
            ) {

                scoreMap[
                    result.student_id
                ] = {};

            }


            const score =
                getScore(
                    result
                );


            scoreMap[
                result.student_id
            ][
                result.subtest_id
            ] =
                score;

        }
    );


    /*
       SISWA
    */

    const students =
        getStudentsForDetail(
            testId
        );


    students.forEach(
        (
            student,
            index
        ) => {

            const row =
                document.createElement(
                    "tr"
                );


            const noCell =
                document.createElement(
                    "td"
                );


            noCell.textContent =
                index + 1;


            row.appendChild(
                noCell
            );


            const nameCell =
                document.createElement(
                    "td"
                );


            nameCell.innerHTML = `

                <strong>
                    ${escapeHTML(
                        student.nama
                    )}
                </strong>

            `;


            nameCell.style.cursor =
                "pointer";


            nameCell.addEventListener(
                "click",
                function () {

                    openStudent(
                        student.student_id
                    );

                }
            );


            row.appendChild(
                nameCell
            );


            subtestIds.forEach(
                subtestId => {

                    const cell =
                        document.createElement(
                            "td"
                        );


                    const value =
                        scoreMap[
                            student.student_id
                        ]?.[
                            subtestId
                        ];


                    if (
                        value === null ||
                        value === undefined
                    ) {

                        cell.textContent =
                            "—";

                        cell.className =
                            "score-empty";

                    } else {

                        cell.textContent =
                            value;

                        cell.className =
                            getScoreCellClass(
                                value
                            );

                    }


                    row.appendChild(
                        cell
                    );

                }
            );


            body.appendChild(
                row
            );

        }
    );


    applyDetailSearch();

}


/* =========================================================
   DETAIL SUBTEST ORDER
========================================================= */

function getOrderedSubtestIds(
    testId,
    results
) {

    /*
       Ambil subtest yang benar-benar
       muncul pada TO tersebut.
    */

    const ids =
        [
            ...new Set(
                results
                    .map(
                        result =>
                            result.subtest_id
                    )
                    .filter(Boolean)
            )
        ];


    /*
       Coba gunakan urutan SUBTESTS
       dari database terlebih dahulu.
    */

    const masterOrder =
        (
            dashboardData.subtests ||
            []
        )

        .map(
            subtest =>
                subtest.subtest_id
        );


    const ordered =
        masterOrder.filter(
            id =>
                ids.includes(
                    id
                )
        );


    /*
       Kalau ada ID yang tidak ada
       di master, tetap masukkan.
    */

    ids.forEach(
        id => {

            if (
                !ordered.includes(
                    id
                )
            ) {

                ordered.push(
                    id
                );

            }

        }
    );


    return ordered;

}


/* =========================================================
   DETAIL STUDENTS
========================================================= */

function getStudentsForDetail(
    testId
) {

    const participantIds =
        new Set(
            getResults(
                testId
            )
            .map(
                result =>
                    result.student_id
            )
        );


    return (
        dashboardData.students || []
    )

    .filter(
        student =>
            participantIds.has(
                student.student_id
            )
    )

    .filter(
        student => {

            if (
                !detailSearchKeyword
            ) {

                return true;

            }


            const keyword =
                detailSearchKeyword
                    .toLowerCase();


            return String(
                student.nama || ""
            )
            .toLowerCase()
            .includes(
                keyword
            );

        }
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
    );

}


/* =========================================================
   DETAIL SCORE COLOR
========================================================= */

function getScoreCellClass(
    score
) {

    if (
        score < 500
    ) {

        return "score-low";

    }


    if (
        score < 600
    ) {

        return "score-medium";

    }


    if (
        score >= 700
    ) {

        return "score-high";

    }


    return "score-normal";

}


/* =========================================================
   DETAIL SEARCH
========================================================= */

function initDetailSearch() {

    const search =
        document.getElementById(
            "detailSearch"
        );


    if (!search) return;


    search.addEventListener(
        "input",
        function () {

            detailSearchKeyword =
                this.value
                    .trim();


            renderDetailTO(
                currentDetailTestId
            );

        }
    );

}


function applyDetailSearch() {

    const search =
        document.getElementById(
            "detailSearch"
        );


    if (
        search &&
        search.value !==
        detailSearchKeyword
    ) {

        search.value =
            detailSearchKeyword;

    }

}


/* =========================================================
   PRINT DETAIL TO
========================================================= */

function initPrint() {

    const button =
        document.getElementById(
            "printDetailButton"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            printDetailTO();

        }
    );

}


function printDetailTO() {

    const table =
        document.getElementById(
            "detailTable"
        );


    if (!table) return;


    const title =
        getTestName(
            currentDetailTestId
        );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Pop-up diblokir browser. Silakan izinkan pop-up untuk mencetak."
        );


        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                ${escapeHTML(
                    title
                )}
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {
                    font-family:
                        Inter,
                        Arial,
                        sans-serif;

                    margin: 24px;

                    color: #172033;
                }


                h1 {
                    font-size: 22px;

                    margin-bottom: 4px;
                }


                p {
                    margin-top: 0;

                    color: #64748b;
                }


                table {
                    width: 100%;

                    border-collapse:
                        collapse;

                    font-size: 10px;
                }


                th,
                td {
                    border:
                        1px solid #cbd5e1;

                    padding:
                        6px 8px;

                    text-align:
                        center;
                }


                th {
                    background:
                        #f1f5f9;

                    font-weight:
                        700;
                }


                td:nth-child(2),
                th:nth-child(2) {
                    text-align:
                        left;
                }


                .score-low {
                    color:
                        #dc2626;

                    font-weight:
                        700;
                }


                .score-medium {
                    color:
                        #d97706;

                    font-weight:
                        700;
                }


                .score-high {
                    color:
                        #15803d;

                    font-weight:
                        700;
                }


                @page {
                    size:
                        landscape;

                    margin:
                        10mm;
                }

            </style>

        </head>


        <body>

            <h1>
                Detail ${escapeHTML(
                    title
                )}
            </h1>

            <p>
                Student Analytics — TKA & UTBK
            </p>


            ${table.outerHTML}


        </body>

        </html>

    `);


    printWindow.document.close();


    setTimeout(
        function () {

            printWindow.focus();

            printWindow.print();

        },
        500
    );

}


/* =========================================================
   STUDENT DETAIL
========================================================= */

function renderStudentDetail() {

    const profile =
        document.getElementById(
            "studentProfile"
        );


    const scoresContainer =
        document.getElementById(
            "studentScores"
        );


    if (
        !profile ||
        !scoresContainer
    ) return;


    const student =
        getStudent(
            currentStudentId
        );


    if (!student) {

        profile.innerHTML = `

            <div class="card">

                <div class="empty-score">
                    Siswa belum dipilih.
                </div>

            </div>

        `;


        scoresContainer.innerHTML =
            "";


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
                    getScore(
                        result
                    )

            })
        )

        .filter(
            result =>
                result.nilai !== null
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

        <div class="card">

            <div class="student-profile">

                <div>

                    <div class="profile-name">
                        ${escapeHTML(
                            student.nama
                        )}
                    </div>

                    <div class="profile-info">

                        ${escapeHTML(
                            student.sekolah ||
                            "-"
                        )}

                        •

                        ${escapeHTML(
                            student.kelas ||
                            "-"
                        )}

                        •

                        ${escapeHTML(
                            student.rombel ||
                            "-"
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
                        ${
                            highest ||
                            "—"
                        }
                    </div>

                </div>


                <div>

                    <div class="profile-kpi-label">
                        Terendah
                    </div>

                    <div class="profile-kpi-value">
                        ${
                            lowest ||
                            "—"
                        }
                    </div>

                </div>


            </div>

        </div>

    `;


    renderStudentScores(
        numericResults
    );

}


function renderStudentScores(
    results
) {

    const container =
        document.getElementById(
            "studentScores"
        );


    if (!container) return;


    const mandatoryIds = [
        "TKA01",
        "TKA02",
        "TKA03"
    ];


    const mandatory =
        results.filter(
            result =>
                mandatoryIds.includes(
                    result.subtest_id
                )
        );


    const optional =
        results.filter(
            result =>
                !mandatoryIds.includes(
                    result.subtest_id
                )
        );


    container.innerHTML = `

        <div class="card">

            <div class="card-title">
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


        <br>


        <div class="card">

            <div class="card-title">
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

    `;

}


/* =========================================================
   SCORE CARDS
   IMPORTANT:
   subtest_id TIDAK DITAMPILKAN
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
                String(
                    a.subtest_id
                )
                .localeCompare(
                    String(
                        b.subtest_id
                    )
                )
        )

        .map(
            result => {

                const score =
                    result.nilai;


                let scoreClass =
                    "green";


                if (
                    score < 500
                ) {

                    scoreClass =
                        "red";

                }

                else if (
                    score < 600
                ) {

                    scoreClass =
                        "yellow";

                }


                return `

                    <div class="score-card">

                        <div class="score-card-name">
                            ${escapeHTML(
                                getSubtestName(
                                    result.subtest_id
                                )
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
            currentStudentTestId;

    }


    switchPage(
        "students"
    );


    renderStudentDetail();

}


/* =========================================================
   RANKING PAGE
========================================================= */

function renderRankingPage(
    testId
) {

    if (!testId) return;


    renderRankingTable(
        calculateStudentAnalysis(
            testId
        ),
        "rankingPageTable"
    );

}


/* =========================================================
   INTERVENTION PAGE
========================================================= */

function renderInterventionPage(
    testId
) {

    const container =
        document.getElementById(
            "interventionPageList"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!testId) {

        container.innerHTML = `

            <div class="empty-score">
                Belum ada tes.
            </div>

        `;

        return;

    }


    const students =
        calculateStudentAnalysis(
            testId
        )

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
        );


    if (!students.length) {

        container.innerHTML = `

            <div class="student">

                <div>

                    <div class="student-name">
                        Tidak ada siswa yang perlu
                        diintervensi.
                    </div>

                    <div class="student-subtitle">
                        Semua siswa berada pada
                        rata-rata ≥ 600.
                    </div>

                </div>

                <span class="status green">
                    GOOD
                </span>

            </div>

        `;

        return;

    }


    students.forEach(
        student => {

            const status =
                getStudentStatus(
                    student.average
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "student";


            item.style.cursor =
                "pointer";


            item.innerHTML = `

                <div>

                    <div class="student-name">
                        ${escapeHTML(
                            student.nama
                        )}
                    </div>

                    <div class="student-subtitle">

                        ${escapeHTML(
                            student.sekolah ||
                            "-"
                        )}

                        • Rata-rata:
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


            item.addEventListener(
                "click",
                function () {

                    openStudent(
                        student.student_id
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   PAGE SWITCH
========================================================= */

function switchPage(
    page
) {

    const buttons =
        document.querySelectorAll(
            ".menu button"
        );


    buttons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.page ===
                page
            );

        }
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

}


/* =========================================================
   UTILITY
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


    return String(
        name
    )
    .trim()
    .split(
        /\s+/
    )[0];

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


    return String(
        value
    )

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


/* =========================================================
   LOADING
========================================================= */

function showLoadingState() {

    const elements = [

        "totalStudents",
        "participants",
        "notParticipants",
        "averageScore",
        "tkaParticipants",
        "tkaAverage",
        "tkaHighest",
        "tkaLowest"

    ];


    elements.forEach(
        id => {

            setText(
                id,
                "…"
            );

        }
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    const box =
        document.getElementById(
            "errorBox"
        );


    if (!box) {

        console.error(
            message
        );

        return;

    }


    box.style.display =
        "block";


    box.textContent =
        message;

}
