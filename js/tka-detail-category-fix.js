/* TKA detail score category + legend fix */
(function () {
    function install() {
        if (typeof window.getTKAScoreClass === "function") {
            window.getTKAScoreClass = function (score, testOrId) {
                var value = Number(score);
                if (!Number.isFinite(value)) return "score-normal";

                var scale = typeof window.getTKAScoreScale === "function"
                    ? window.getTKAScoreScale(testOrId)
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
            };
        }

        if (typeof window.renderDetailTO === "function" && !window.__tkaDetailCategoryWrapped) {
            var originalRenderDetailTO = window.renderDetailTO;

            window.renderDetailTO = function (testId) {
                originalRenderDetailTO(testId);
                addLegend(testId);
            };

            window.__tkaDetailCategoryWrapped = true;
        }

        addLegend(window.currentDetailTestId || "");
    }

    function addLegend(testId) {
        var table = document.getElementById("detailTable");
        if (!table) return;

        var old = document.getElementById("tkaDetailScoreLegend");
        if (old) old.remove();

        var title = document.getElementById("detailTestTitle");
        if (!title) return;

        var legend = document.createElement("div");
        legend.id = "tkaDetailScoreLegend";
        legend.className = "tka-detail-score-legend";
        legend.innerHTML =
            '<span class="legend-title">Legenda Kategori TKA:</span>' +
            '<span class="legend-item score-low"><i></i> Kurang <small>200–424</small></span>' +
            '<span class="legend-item score-medium"><i></i> Memadai <small>425–599</small></span>' +
            '<span class="legend-item score-good"><i></i> Baik <small>600–724</small></span>' +
            '<span class="legend-item score-excellent"><i></i> Istimewa <small>≥725</small></span>';

        table.parentElement.parentElement.appendChild(legend);
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
            #detailTable td.score-low { color:#c2410c; background:#ffedd5; }
            #detailTable td.score-medium { color:#1d4ed8; background:#dbeafe; }
            #detailTable td.score-good { color:#047857; background:#d1fae5; }
            #detailTable td.score-excellent { color:#166534; background:#dcfce7; }
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
