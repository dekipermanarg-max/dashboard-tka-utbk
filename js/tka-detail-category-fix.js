/* TKA detail score category + legend fix */
(function () {
    var originalRenderDetailTO = null;

    function categoryClass(value, testId) {
        value = Number(value);
        if (!Number.isFinite(value)) return "score-normal";

        var scale = typeof window.getTKAScoreScale === "function"
            ? window.getTKAScoreScale(testId)
            : "200-800";

        if (scale === "0-100") {
            if (value < 50) return "score-low";
            if (value < 60) return "score-medium";
            return "score-high";
        }

        // TKA 200-800 scale:
        // 200-424 Kurang | 425-599 Memadai | 600-724 Baik | 725+ Istimewa
        if (value < 425) return "score-low";
        if (value < 600) return "score-medium";
        if (value < 725) return "score-good";
        return "score-excellent";
    }

    function normalizeTableScores(testId) {
        var table = document.getElementById("detailTable");
        if (!table) return;

        table.querySelectorAll("tbody td").forEach(function (cell) {
            var value = Number(String(cell.textContent || "").trim());
            if (!Number.isFinite(value)) return;

            cell.classList.remove(
                "score-low",
                "score-medium",
                "score-good",
                "score-excellent",
                "score-high",
                "score-normal"
            );
            cell.classList.add(categoryClass(value, testId));
        });
    }

    function install() {
        if (typeof window.getTKAScoreClass === "function") {
            window.getTKAScoreClass = function (score, testOrId) {
                return categoryClass(score, testOrId);
            };
        }

        if (typeof window.renderDetailTO === "function" && !window.__tkaDetailCategoryWrapped) {
            originalRenderDetailTO = window.renderDetailTO;

            window.renderDetailTO = function (testId) {
                originalRenderDetailTO(testId);
                normalizeTableScores(testId);
                addLegend(testId);
            };

            window.__tkaDetailCategoryWrapped = true;
        }

        var current = window.currentDetailTestId || "";
        normalizeTableScores(current);
        addLegend(current);
    }

    function addLegend(testId) {
        var table = document.getElementById("detailTable");
        if (!table) return;

        var old = document.getElementById("tkaDetailScoreLegend");
        if (old) old.remove();

        var container = table.closest(".detail-table-card") || table.parentElement.parentElement;
        if (!container) return;

        var legend = document.createElement("div");
        legend.id = "tkaDetailScoreLegend";
        legend.className = "tka-detail-score-legend";
        legend.innerHTML =
            '<span class="legend-title">Legenda Kategori TKA:</span>' +
            '<span class="legend-item score-low"><i></i> Kurang <small>200–424</small></span>' +
            '<span class="legend-item score-medium"><i></i> Memadai <small>425–599</small></span>' +
            '<span class="legend-item score-good"><i></i> Baik <small>600–724</small></span>' +
            '<span class="legend-item score-excellent"><i></i> Istimewa <small>≥725</small></span>';

        container.appendChild(legend);
    }

    function injectStyle() {
        if (document.getElementById("tkaDetailCategoryStyle")) return;

        var style = document.createElement("style");
        style.id = "tkaDetailCategoryStyle";
        style.textContent = `
            #detailTable td.score-low,
            #detailTable td.score-medium,
            #detailTable td.score-good,
            #detailTable td.score-excellent {
                font-weight: 700;
                text-align: center;
                border-radius: 4px;
            }
            #detailTable td.score-low { color:#c2410c !important; background:#ffedd5 !important; }
            #detailTable td.score-medium { color:#1d4ed8 !important; background:#dbeafe !important; }
            #detailTable td.score-good { color:#047857 !important; background:#d1fae5 !important; }
            #detailTable td.score-excellent { color:#166534 !important; background:#dcfce7 !important; }
            .tka-detail-score-legend {
                display:flex;
                flex-wrap:wrap;
                align-items:center;
                gap:10px 16px;
                margin-top:14px;
                padding:11px 14px;
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:8px;
                font-size:11px;
                color:#475569;
            }
            .tka-detail-score-legend .legend-title { font-weight:700; color:#172033; }
            .tka-detail-score-legend .legend-item { display:inline-flex; align-items:center; gap:5px; font-weight:600; }
            .tka-detail-score-legend .legend-item i { width:9px; height:9px; border-radius:50%; display:inline-block; }
            .tka-detail-score-legend .score-low i { background:#f97316; }
            .tka-detail-score-legend .score-medium i { background:#3b82f6; }
            .tka-detail-score-legend .score-good i { background:#10b981; }
            .tka-detail-score-legend .score-excellent i { background:#22c55e; }
            .tka-detail-score-legend small { font-weight:400; color:#64748b; }
        `;
        document.head.appendChild(style);
    }

    function start() {
        injectStyle();
        install();
        setTimeout(install, 100);
        setTimeout(install, 500);
        setTimeout(install, 1200);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
