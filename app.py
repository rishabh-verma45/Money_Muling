from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import networkx as nx
import json
import io
import time

app = Flask(__name__)

analysis_result = {}

@app.route('/')
def home():
    return render_template("index.html")


@app.route('/upload', methods=['POST'])
def upload():
    global analysis_result

    start_time = time.time()

    file = request.files['file']
    df = pd.read_csv(file)

    G = nx.DiGraph()

    for _, row in df.iterrows():
        G.add_edge(row['sender_id'], row['receiver_id'])

    suspicious_accounts = {}
    fraud_rings = []
    ring_counter = 1

    # =====================
    # 1️⃣ Cycle Detection
    # =====================
    cycles = list(nx.simple_cycles(G))

    for cycle in cycles:
        if 3 <= len(cycle) <= 5:
            ring_id = f"RING_{ring_counter:03d}"
            ring_counter += 1

            fraud_rings.append({
                "ring_id": ring_id,
                "member_accounts": cycle,
                "pattern_type": "cycle",
                "risk_score": 95.0
            })

            for acc in cycle:
                suspicious_accounts[acc] = {
                    "account_id": acc,
                    "suspicion_score": 90.0,
                    "detected_patterns": [f"cycle_length_{len(cycle)}"],
                    "ring_id": ring_id
                }

    # =====================
    # 2️⃣ Smurfing Detection
    # =====================
    for node in G.nodes():
        if G.in_degree(node) >= 5:
            suspicious_accounts[node] = {
                "account_id": node,
                "suspicion_score": 80.0,
                "detected_patterns": ["fan_in_high"],
                "ring_id": "SMURFING"
            }

        if G.out_degree(node) >= 5:
            suspicious_accounts[node] = {
                "account_id": node,
                "suspicion_score": 75.0,
                "detected_patterns": ["fan_out_high"],
                "ring_id": "SMURFING"
            }

    suspicious_accounts = list(suspicious_accounts.values())

    suspicious_accounts = sorted(
        suspicious_accounts,
        key=lambda x: x["suspicion_score"],
        reverse=True
    )

    processing_time = round(time.time() - start_time, 2)

    analysis_result = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": fraud_rings,
        "summary": {
            "total_accounts_analyzed": len(G.nodes()),
            "suspicious_accounts_flagged": len(suspicious_accounts),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": processing_time
        }
    }

    suspicious_ids = {a["account_id"] for a in suspicious_accounts}

    graph_data = {
        "nodes": [
            {
                "id": n,
                "label": n,
                "color": "red" if n in suspicious_ids else "#3498db"
            }
            for n in G.nodes()
        ],
        "edges": [{"from": u, "to": v} for u, v in G.edges()]
    }

    return jsonify({
        "analysis": analysis_result,
        "graph": graph_data
    })


@app.route('/download')
def download():
    global analysis_result

    if not analysis_result:
        return "No data available"

    json_data = json.dumps(analysis_result, indent=4)

    buffer = io.BytesIO()
    buffer.write(json_data.encode())
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="fraud_detection_output.json",
        mimetype="application/json"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)