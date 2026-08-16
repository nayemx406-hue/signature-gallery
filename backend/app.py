from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "shop.db"

app = Flask(__name__)
CORS(app)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            district TEXT NOT NULL,
            address TEXT NOT NULL,
            delivery_type TEXT NOT NULL,
            subtotal INTEGER NOT NULL,
            delivery_charge INTEGER NOT NULL,
            total INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


@app.get("/")
def home_page():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(BASE_DIR / "css", filename)


@app.get("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(BASE_DIR / "js", filename)


@app.get("/images/<path:filename>")
def image_files(filename):
    return send_from_directory(BASE_DIR / "images", filename)


@app.get("/admin.html")
def admin_page():
    return send_from_directory(BASE_DIR, "admin.html")


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "Shop backend is running"
    })


@app.get("/api/orders")
def get_orders():
    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM orders
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])


@app.post("/api/orders")
def create_order():

    data = request.get_json()

    required = [
        "order_id",
        "customer_name",
        "phone",
        "district",
        "address",
        "delivery_type",
        "subtotal",
        "delivery_charge",
        "total"
    ]

    for field in required:
        if field not in data:
            return jsonify({
                "error": f"Missing field: {field}"
            }), 400

    conn = get_db()

    try:

        conn.execute("""
            INSERT INTO orders (
                order_id,
                customer_name,
                phone,
                district,
                address,
                delivery_type,
                subtotal,
                delivery_charge,
                total
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["order_id"],
            data["customer_name"],
            data["phone"],
            data["district"],
            data["address"],
            data["delivery_type"],
            data["subtotal"],
            data["delivery_charge"],
            data["total"]
        ))

        conn.commit()

    except sqlite3.IntegrityError:

        conn.close()

        return jsonify({
            "error": "Order ID already exists"
        }), 409

    conn.close()

    return jsonify({
        "success": True,
        "order_id": data["order_id"]
    }), 201


@app.patch("/api/orders/<order_id>/status")
def update_order_status(order_id):

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    allowed = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled"
    ]

    if status not in allowed:
        return jsonify({
            "error": "Invalid status"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
    """, (status, order_id))

    conn.commit()

    if cursor.rowcount == 0:
        conn.close()
        return jsonify({
            "error": "Order not found"
        }), 404

    conn.close()

    return jsonify({
        "success": True,
        "order_id": order_id,
        "status": status
    })


if __name__ == "__main__":
    init_db()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
