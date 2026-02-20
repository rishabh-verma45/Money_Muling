# 🛡️ FinForensics - Money Muling Detection Engine

**FinForensics** is a powerful, real-time fraud analytics platform designed to detect money muling activities and organized fraud rings using graph-based intelligence. By analyzing transaction flows, the engine identifies suspicious patterns like Smurfing and Circular Transfers, providing visual and data-driven insights for financial investigators.

🚀 **Live Demo:** https://money-muling-0l57.onrender.com/

---

## ✨ Tech Stack

* **Frontend:** HTML5, CSS3 (Modern UI with Dark/Light mode support), JavaScript (ES6+).
* **Graph Visualization:** [Vis-network.js](https://visjs.org/) for interactive network rendering.
* **Backend:** Flask (Python).
* **Data Analysis:** Pandas for CSV processing and NetworkX for Graph Algorithms.
* **Deployment:** Gunicorn / Heroku.

---

## 🏗️ System Architecture



1.  **Data Ingestion:** The system accepts `.csv` files containing transaction records including `sender_id`, `receiver_id`, and `amount`.
2.  **Graph Construction:** Transactions are converted into a **Directed Graph (DiGraph)** where accounts are nodes and transactions are edges.
3.  **Analysis Engine:** The backend runs concurrent detection algorithms to identify cycles and high-degree patterns.
4.  **Visualization Layer:** Results are pushed to a web interface that renders the network, highlighting high-risk accounts in red.
5.  **Reporting:** Generates a downloadable JSON report containing detailed fraud ring memberships and risk scores.

---

## 🧠 Algorithm Approach

The engine utilizes two primary detection strategies within the `app.py` logic:

### 1. Cycle Detection (Money Laundering Loops)
* **Logic:** Detects circular transfers (3-5 members) where money is moved through multiple accounts to obscure the source.
* **Algorithm:** `nx.simple_cycles(G)`.
* **Complexity:** $O((N + E)(C + 1))$, where $N$ is nodes, $E$ is edges, and $C$ is the number of elementary cycles.

### 2. Smurfing Detection (Fan-In / Fan-Out)
* **Logic:** Identifies "Layering" where an account has unusually high incoming or outgoing connections.
* **Algorithm:** In-degree and Out-degree analysis.
* **Complexity:** $O(N)$ to iterate through nodes and check degree thresholds.

---

## 📈 Suspicion Score Methodology

Every account is assigned a risk-based **Suspicion Score** (0-100) based on detected behaviors:

| Pattern Type | Score | Reasoning |
| :--- | :--- | :--- |
| **Circular Transfer** | **90.0** | High indicator of intentional money laundering loops. |
| **Fan-In High** | **80.0** | Suggests a "Collector" account receiving smurfed funds. |
| **Fan-Out High** | **75.0** | Suggests a "Distributor" account dispersing illicit gains. |

**Fraud Rings:** Accounts in a cycle are grouped into a `RING_ID` with a high **Risk Score of 95.0**.

---

## 🛠️ Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/rishabh-verma45/money_muling.git](https://github.com/rishabh-verma45/money_muling.git)
    cd money_muling
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Application:**
    ```bash
    python app.py
    ```
    Access the app at `http://127.0.0.1:5000`.

---

## 💬 Usage Instructions

1.  **Upload:** Click **"Choose CSV File"** and select your transaction data (formatted like `test_transactions.csv`).
2.  **Analyze:** Click **"Analyze"** to trigger the engine. The floating title will disappear to reveal your graph.
3.  **Explore:** Click on **Red Nodes** to view suspicion scores and detected patterns in the side panel.
4.  **Export:** Click **"Download JSON Report"** to save the analysis results.

---

## ⚠️ Known Limitations

* **Cycle Length:** Currently optimized for cycles of 3 to 5 nodes for performance.
* **Fixed Thresholds:** Smurfing is flagged at 5+ connections by default.
* **Data Volume:** Large datasets may cause rendering lag in the browser-based graph interaction.

---

## 👥 Team Members

* **Rishabh Verma** - Lead Developer & Algorithm Design 🚀

---
Developed for financial integrity. ✨💬
