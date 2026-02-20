document.addEventListener("DOMContentLoaded", function () {
    let network = null;
    let currentAnalysis = null;

    const themeToggle = document.getElementById("themeToggle");
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeToggle.innerText = "☀️";
    }

    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("light");
        if (document.body.classList.contains("light")) {
            localStorage.setItem("theme", "light");
            themeToggle.innerText = "☀️";
        } else {
            localStorage.setItem("theme", "dark");
            themeToggle.innerText = "🌙";
        }
        if (currentAnalysis && currentAnalysis.graphData) {
            renderGraph(currentAnalysis.graphData);
            populateFraudRings(currentAnalysis.fraud_rings);
        }
    });

    const loader = document.getElementById("netflixLoader");
    function showLoader() { loader.classList.add("active"); }
    function hideLoader() { loader.classList.remove("active"); }

    const fileInput = document.getElementById("fileInput");
    const fileNameDisplay = document.getElementById("fileName");
    fileInput.addEventListener("change", function () {
        fileNameDisplay.innerText = this.files[0] ? this.files[0].name : "Choose CSV File";
    });

    const uploadForm = document.getElementById("uploadForm");
    uploadForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        showLoader();
        const formData = new FormData(this);
        const response = await fetch("/upload", { method: "POST", body: formData });
        const responseData = await response.json();

        // Hides floating text when the graph data is loaded
        document.getElementById("floatingText").classList.add("hidden");

        currentAnalysis = responseData.analysis;
        currentAnalysis.graphData = responseData.graph;
        document.getElementById("accounts").innerText = currentAnalysis.summary.total_accounts_analyzed;
        document.getElementById("suspicious").innerText = currentAnalysis.summary.suspicious_accounts_flagged;
        document.getElementById("rings").innerText = currentAnalysis.summary.fraud_rings_detected;
        document.getElementById("time").innerText = currentAnalysis.summary.processing_time_seconds;

        renderGraph(responseData.graph);
        populateFraudRings(currentAnalysis.fraud_rings);
    });

    function renderGraph(graph) {
        const container = document.getElementById("network");
        const suspiciousIds = currentAnalysis.suspicious_accounts.map(acc => acc.account_id);
        const isLight = document.body.classList.contains("light");

        const formattedNodes = graph.nodes.map(node => {
            const isSuspicious = suspiciousIds.includes(node.id);
            return {
                id: node.id,
                label: node.id,
                shape: "circle",
                size: 28,
                font: { size: 12, color: isLight ? "#000000" : "#ffffff", face: "Segoe UI", align: "center" },
                borderWidth: 2,
                color: isSuspicious ? { background: "#ef4444", border: "#7f1d1d" } : { background: "#3b82f6", border: "#1e40af" }
            };
        });

        const data = { nodes: new vis.DataSet(formattedNodes), edges: new vis.DataSet(graph.edges) };
        const options = {
            edges: { arrows: { to: { enabled: true } }, width: 1.5, color: "#64748b", smooth: { type: "dynamic" } },
            interaction: { hover: true },
            physics: { enabled: true, solver: "forceAtlas2Based" }
        };

        network = new vis.Network(container, data, options);
        container.classList.remove("active");
        setTimeout(() => { container.classList.add("active"); hideLoader(); }, 700);
        network.on("click", function (params) { if (params.nodes.length > 0) showSelectedAccount(params.nodes[0]); });
    }

    function showSelectedAccount(accountId) {
        const panel = document.getElementById("selectedAccount");
        const suspicious = currentAnalysis.suspicious_accounts.find(acc => acc.account_id === accountId);
        if (suspicious) {
            panel.innerHTML = `<strong>${accountId}</strong><br>Score: ${suspicious.suspicion_score}<br>Ring: ${suspicious.ring_id}<br>Patterns: ${suspicious.detected_patterns.join(", ")}`;
        } else {
            panel.innerHTML = `<strong>${accountId}</strong><br>Clean Account`;
        }
    }

    function populateFraudRings(rings) {
        const container = document.getElementById("ringList");
        container.innerHTML = "";
        const isLight = document.body.classList.contains("light");
        rings.forEach(ring => {
            const div = document.createElement("div");
            div.style.marginBottom = "12px"; div.style.padding = "8px"; div.style.borderRadius = "6px";
            div.style.background = isLight ? "#e5e7eb" : "#1f2937";
            div.style.color = isLight ? "#111" : "#fff";
            div.innerHTML = `<strong>${ring.ring_id}</strong><br>${ring.pattern_type.toUpperCase()}<br>Risk: ${ring.risk_score}<br>${ring.member_accounts.join(" → ")}`;
            container.appendChild(div);
        });
    }

    document.getElementById("downloadBtn").addEventListener("click", function () { window.location.href = "/download"; });
});
