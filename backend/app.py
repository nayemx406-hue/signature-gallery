from flask import Flask, request, jsonify, send_from_directory, session, redirect
from flask_cors import CORS
import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "shop.db"

app = Flask(__name__)
CORS(app)

app.secret_key = "my-secret-key-123"
ADMIN_PASSWORD = "@Signature_Xallery00$"


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
@app.get("/")
def home_page():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/index.html")
def index_html_page():
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


@app.get("/product-details.html")
def product_details_page():
    html_path = BASE_DIR / "product-details.html"
    html = html_path.read_text(encoding="utf-8")

    product_type = request.args.get("type", "special")
    product_index = request.args.get("index", "0")

    if product_type == "special" and product_index == "1":
        title = "Premium China Fabric T-Shirt | Signature Gallery"
        description = "Premium China Fabric T-Shirt — comfortable fit, smooth feel and modern style."
        image = "https://signature-gallery.onrender.com/images/products/product-02/product-02-main.png"
    else:
        title = "U.S. Polo Style Premium Baggy Joggers | Signature Gallery"
        description = "Premium quality joggers with comfortable fit and stylish design."
        image = "https://signature-gallery.onrender.com/images/products/product-01-main.png"

    import re

    html = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        f'<meta property="og:title" content="{title}">',
        html,
        count=1
    )

    html = re.sub(
        r'<meta property="og:description" content="[^"]*">',
        f'<meta property="og:description" content="{description}">',
        html,
        count=1
    )

    html = re.sub(
        r'<meta property="og:image" content="[^"]*">',
        f'<meta property="og:image" content="{image}">',
        html,
        count=1
    )

    html = re.sub(
        r'<title>.*?</title>',
        f'<title>{title}</title>',
        html,
        count=1
    )

    return html


@app.get("/admin.html")
def admin_page():
    if not session.get("admin"):
        return redirect("/admin-login")

    return send_from_directory(BASE_DIR, "admin.html")



@app.route("/admin-login", methods=["GET","POST"])
def admin_login():

    if request.method == "POST":
        password = request.form.get("password")

        if password == ADMIN_PASSWORD:
            session["admin"] = True
            return redirect("/admin.html")

        return "Wrong Password"

    return """
    <!DOCTYPE html>
    <html>
    <head>
    <title>Admin Login</title>
    <style>
    body{
        margin:0;
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#080808;
        font-family:Arial;
        color:white;
    }
    .login-box{
        width:330px;
        padding:35px;
        background:#151515;
        border-radius:20px;
        text-align:center;
        box-shadow:0 0 30px rgba(212,175,55,.25);
        border:1px solid #d4af37;
    }
    h2{
        color:#d4af37;
        margin-bottom:10px;
    }
    p{
        color:#aaa;
    }
    input{
        width:90%;
        padding:14px;
        margin:20px 0;
        border-radius:10px;
        border:1px solid #444;
        background:#222;
        color:white;
    }
    button{
        width:100%;
        padding:14px;
        border:0;
        border-radius:10px;
        background:#d4af37;
        font-weight:bold;
        cursor:pointer;
    }
    </style>
    </head>
    <body>
    <div class="login-box">
        <h2>Welcome To Admin Panel</h2>
        <p>SIGNATURE Gallery</p>
        <form method="POST">
            <input name="password" type="password" placeholder="Enter Admin Password">
            <button>Login</button>
        </form>
    </div>
    </body>
    </html>
    """

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


@app.get("/api/orders/status/<status>")
def get_orders_by_status(status):
    conn = get_db()

    rows = conn.execute("""
        SELECT *
        FROM orders
        WHERE status = ?
        ORDER BY id DESC
    """, (status,)).fetchall()

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
                total,
                payment_method,
                payment_number,
                transaction_id,
                items
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["order_id"],
            data["customer_name"],
            data["phone"],
            data["district"],
            data["address"],
            data["delivery_type"],
            data["subtotal"],
            data["delivery_charge"],
            data["total"],
            data.get("payment_method"),
            data.get("payment_number"),
            data.get("transaction_id"),
            json.dumps(data.get("items", []))
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
