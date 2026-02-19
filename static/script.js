document.addEventListener("DOMContentLoaded", function () {

    let network = null;
    let currentAnalysis = null;

    /* =========================
       THEME TOGGLE
    ========================== */

    const themeToggle = document.getElementById("themeToggle");

    // Load saved theme
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

        // Re-render if graph exists
        if (currentAnalysis && currentAnalysis.graphData) {
            renderGraph(currentAnalysis.graphData);
            populateFraudRings(currentAnalysis.fraud_rings);
        }
    });

    /* =========================
       LOADER
    ========================== */

    const loader = document.getElementById("netflixLoader");

    function showLoader() {
        loader.classList.add("active");
    }

    function hideLoader() {
        loader.classList.remove("active");
    }

    /* =========================
       FILE NAME DISPLAY
    ========================== */

    const fileInput = document.getElementById("fileInput");
    const fileNameDisplay = document.getElementById("fileName");

    fileInput.addEventListener("change", function () {
        fileNameDisplay.innerText = this.files[0]
            ? this.files[0].name
            : "Choose CSV File";
    });

    /* =========================
       UPLOAD FORM
    ========================== */

    const uploadForm = document.getElementById("uploadForm");

    uploadForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        showLoader();
        document.querySelector(".hero-text").classList.add("hidden");

        const formData = new FormData(this);

        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const responseData = await response.json();

        currentAnalysis = responseData.analysis;
        currentAnalysis.graphData = responseData.graph;

        const graph = responseData.graph;

        document.getElementById("accounts").innerText =
            currentAnalysis.summary.total_accounts_analyzed;

        document.getElementById("suspicious").innerText =
            currentAnalysis.summary.suspicious_accounts_flagged;

        document.getElementById("rings").innerText =
            currentAnalysis.summary.fraud_rings_detected;

        document.getElementById("time").innerText =
            currentAnalysis.summary.processing_time_seconds;

        renderGraph(graph);
        populateFraudRings(currentAnalysis.fraud_rings);
    });

    /* =========================
       RENDER GRAPH
    ========================== */

    function renderGraph(graph) {

        const container = document.getElementById("network");
        const suspiciousIds = currentAnalysis.suspicious_accounts.map(
            acc => acc.account_id
        );

        const isLight = document.body.classList.contains("light");

        const formattedNodes = graph.nodes.map(node => {

            const isSuspicious = suspiciousIds.includes(node.id);

            return {
                id: node.id,
                label: node.id,
                shape: "circle",
                size: 28,
                font: {
                    size: 12,
                    color: isLight ? "#000000" : "#ffffff",
                    face: "Segoe UI",
                    align: "center"
                },
                borderWidth: 2,
                color: isSuspicious
                    ? {
                        background: "#ef4444",
                        border: "#7f1d1d"
                    }
                    : {
                        background: "#3b82f6",
                        border: "#1e40af"
                    }
            };
        });

        const data = {
            nodes: new vis.DataSet(formattedNodes),
            edges: new vis.DataSet(graph.edges)
        };

        const options = {
            nodes: { shadow: false },
            edges: {
                arrows: { to: { enabled: true } },
                width: 1.5,
                color: "#64748b",
                smooth: { type: "dynamic" }
            },
            interaction: {
                hover: true,
                hoverConnectedEdges: true
            },
            physics: {
                enabled: true,
                solver: "forceAtlas2Based"
            }
        };

        network = new vis.Network(container, data, options);

        container.classList.remove("active");
        setTimeout(() => {
            container.classList.add("active");
            hideLoader();
        }, 700);

        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                showSelectedAccount(params.nodes[0]);
            }
        });
    }

    /* =========================
       SELECTED ACCOUNT
    ========================== */

    function showSelectedAccount(accountId) {

        const panel = document.getElementById("selectedAccount");

        const suspicious = currentAnalysis.suspicious_accounts.find(
            acc => acc.account_id === accountId
        );

        if (suspicious) {
            panel.innerHTML = `
                <strong>${accountId}</strong><br>
                Suspicion Score: ${suspicious.suspicion_score}<br>
                Ring: ${suspicious.ring_id}<br>
                Patterns: ${suspicious.detected_patterns.join(", ")}
            `;
        } else {
            panel.innerHTML = `
                <strong>${accountId}</strong><br>
                Clean Account
            `;
        }
    }

    /* =========================
       FRAUD RINGS
    ========================== */

    function populateFraudRings(rings) {

        const container = document.getElementById("ringList");
        container.innerHTML = "";

        const isLight = document.body.classList.contains("light");

        rings.forEach(ring => {
            const div = document.createElement("div");

            div.style.marginBottom = "12px";
            div.style.padding = "8px";
            div.style.borderRadius = "6px";

            if (isLight) {
                div.style.background = "#e5e7eb";
                div.style.color = "#111";
                div.style.border = "1px solid #ccc";
            } else {
                div.style.background = "#1f2937";
                div.style.color = "#ffffff";
            }

            div.innerHTML = `
                <strong>${ring.ring_id}</strong><br>
                ${ring.pattern_type.toUpperCase()}<br>
                Risk: ${ring.risk_score}<br>
                ${ring.member_accounts.join(" → ")}
            `;

            container.appendChild(div);
        });
    }

    document.getElementById("downloadBtn").addEventListener("click", function () {
        window.location.href = "/download";
    });

});
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 60; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 1,
        dy: (Math.random() - 0.5) * 1
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59,130,246,0.2)";
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

animate();
