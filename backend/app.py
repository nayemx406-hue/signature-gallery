from flask import Flask, request, jsonify, send_from_directory, session, redirect
from flask_cors import CORS
import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "shop.db"
UPLOAD_DIR = BASE_DIR / "images" / "products" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SIGNATURE GALLERY — Admin Login</title>

<style>
*{
    box-sizing:border-box;
}

body{
    margin:0;
    min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    overflow:hidden;
    font-family:Arial, Helvetica, sans-serif;
    background:
        radial-gradient(circle at 20% 20%, rgba(59,130,246,.30), transparent 30%),
        radial-gradient(circle at 80% 80%, rgba(37,99,235,.25), transparent 30%),
        linear-gradient(135deg,#07101f,#0b1730 48%,#06101f);
    color:#0f172a;
}

/* premium 3D floating shapes */

body::before,
body::after{
    content:"";
    position:fixed;
    width:240px;
    height:240px;
    border-radius:50%;
    background:linear-gradient(145deg,rgba(96,165,250,.22),rgba(29,78,216,.04));
    filter:blur(2px);
    box-shadow:
        inset 20px 20px 50px rgba(255,255,255,.08),
        0 30px 80px rgba(0,0,0,.25);
    pointer-events:none;
}

body::before{
    top:-80px;
    left:-70px;
}

body::after{
    right:-80px;
    bottom:-90px;
}

.login-wrap{
    width:min(430px,92vw);
    position:relative;
    z-index:2;
    padding:1px;
    border-radius:30px;
    background:linear-gradient(
        145deg,
        rgba(147,197,253,.75),
        rgba(255,255,255,.15),
        rgba(29,78,216,.65)
    );
    box-shadow:
        0 35px 80px rgba(0,0,0,.42),
        0 10px 30px rgba(37,99,235,.20);
}

.login-box{
    padding:42px 38px 36px;
    border-radius:29px;
    background:
        linear-gradient(145deg,#ffffff,#f3f7fc);
    box-shadow:
        inset 0 1px 0 #ffffff,
        inset 0 -1px 0 rgba(148,163,184,.25);
    text-align:center;
}

.logo-orb{
    width:72px;
    height:72px;
    margin:0 auto 20px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:22px;
    color:white;
    font-size:25px;
    font-weight:900;
    background:linear-gradient(145deg,#3b82f6,#1d4ed8);
    box-shadow:
        0 10px 0 #163ea8,
        0 18px 28px rgba(29,78,216,.30);
    transform:perspective(500px) rotateX(4deg);
}

.brand{
    margin:0;
    color:#0f172a;
    font-size:25px;
    font-weight:900;
    letter-spacing:1.5px;
}

.subtitle{
    margin:8px 0 28px;
    color:#64748b;
    font-size:13px;
    letter-spacing:1.8px;
    font-weight:700;
    text-transform:uppercase;
}

.login-label{
    display:block;
    text-align:left;
    margin:0 0 8px;
    color:#334155;
    font-size:12px;
    font-weight:800;
    letter-spacing:.8px;
}

.password-box{
    position:relative;
}

input{
    width:100%;
    height:54px;
    padding:0 17px;
    border-radius:15px;
    border:1px solid #dbe4f0;
    outline:none;
    background:#ffffff;
    color:#0f172a;
    font-size:15px;
    box-shadow:
        inset 0 2px 5px rgba(15,23,42,.04),
        0 5px 15px rgba(15,23,42,.04);
    transition:.2s ease;
}

input:focus{
    border-color:#3b82f6;
    box-shadow:
        0 0 0 4px rgba(59,130,246,.12),
        0 8px 20px rgba(37,99,235,.10);
}

input::placeholder{
    color:#94a3b8;
}

button{
    width:100%;
    height:55px;
    margin-top:18px;
    border:0;
    border-radius:15px;
    background:linear-gradient(145deg,#3b82f6,#1d4ed8);
    color:white;
    font-size:15px;
    font-weight:900;
    letter-spacing:.5px;
    cursor:pointer;
    box-shadow:
        0 7px 0 #163ea8,
        0 14px 24px rgba(29,78,216,.25);
    transition:transform .16s ease,box-shadow .16s ease;
}

button:hover{
    transform:translateY(-2px);
    box-shadow:
        0 9px 0 #163ea8,
        0 18px 30px rgba(29,78,216,.30);
}

button:active{
    transform:translateY(5px);
    box-shadow:
        0 2px 0 #163ea8,
        0 7px 13px rgba(29,78,216,.20);
}

.secure{
    margin:24px 0 0;
    color:#94a3b8;
    font-size:11px;
    letter-spacing:.5px;
}

.secure span{
    color:#2563eb;
    font-weight:900;
}

@media(max-width:480px){
    .login-box{
        padding:34px 24px 28px;
    }

    .brand{
        font-size:22px;
    }
}
</style>
</head>

<body>

<div class="login-wrap">
    <div class="login-box">

        <div class="logo-orb">SG</div>

        <h1 class="brand">SIGNATURE GALLERY</h1>

        <p class="subtitle">Private Administration</p>

        <form method="POST">

            <label class="login-label">ADMIN PASSWORD</label>

            <div class="password-box">
                <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required>
            </div>

            <button type="submit">
                ENTER ADMIN PANEL
            </button>

        </form>

        <p class="secure">
            <span>●</span> Secure administrator access
        </p>

    </div>
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


# ============================================================
# PRODUCTS API
# ============================================================

def ensure_products_table():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            image TEXT DEFAULT '',
            images TEXT DEFAULT '[]',
            old_price INTEGER DEFAULT 0,
            price INTEGER NOT NULL DEFAULT 0,
            colours_enabled INTEGER DEFAULT 0,
            colours TEXT DEFAULT '[]',
            sizes_enabled INTEGER DEFAULT 0,
            sizes TEXT DEFAULT '[]',
            active INTEGER DEFAULT 1,
            category TEXT DEFAULT 'General',
            offer_percent INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    existing = {
        row["name"]
        for row in conn.execute("PRAGMA table_info(products)").fetchall()
    }

    extra_columns = {
        "category": "TEXT DEFAULT 'General'",
        "offer_percent": "INTEGER DEFAULT 0"
    }

    for column, definition in extra_columns.items():
        if column not in existing:
            conn.execute(
                f"ALTER TABLE products ADD COLUMN {column} {definition}"
            )

    conn.commit()
    conn.close()


def product_row(row):
    data = dict(row)

    try:
        data["images"] = json.loads(data.get("images") or "[]")
    except Exception:
        data["images"] = []

    try:
        data["colours"] = json.loads(data.get("colours") or "[]")
    except Exception:
        data["colours"] = []

    try:
        data["sizes"] = json.loads(data.get("sizes") or "[]")
    except Exception:
        data["sizes"] = []

    data["colours_enabled"] = bool(data.get("colours_enabled"))
    data["sizes_enabled"] = bool(data.get("sizes_enabled"))
    data["active"] = bool(data.get("active"))

    data["offer_text"] = data.get("offer_text") or "LIMITED OFFER"
    return data


@app.post("/api/upload")
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["file"]

    if not file or not file.filename:
        return jsonify({"error": "No image selected"}), 400

    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    ext = Path(file.filename).suffix.lower()

    if ext not in allowed:
        return jsonify({"error": "Unsupported image format"}), 400

    import uuid

    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / filename
    file.save(save_path)

    image_url = f"/images/products/uploads/{filename}"

    return jsonify({
        "success": True,
        "filename": filename,
        "url": image_url
    }), 201


@app.get("/api/products")
def get_products():
    ensure_products_table()

    conn = get_db()
    rows = conn.execute("""
        SELECT *
        FROM products
        ORDER BY id DESC
    """).fetchall()
    conn.close()

    return jsonify([product_row(row) for row in rows])


@app.get("/api/products/<int:product_id>")
def get_product(product_id):
    ensure_products_table()

    conn = get_db()
    row = conn.execute(
        "SELECT * FROM products WHERE id = ?",
        (product_id,)
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product_row(row))


@app.post("/api/products")
def create_product():
    ensure_products_table()

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()

    if not name:
        return jsonify({"error": "Product name is required"}), 400

    try:
        old_price = int(data.get("old_price") or 0)
        price = int(data.get("price") or 0)
        offer_percent = int(data.get("offer_percent") or 0)
    except (TypeError, ValueError):
        return jsonify({"error": "Price and offer must be numbers"}), 400

    colours = data.get("colours", [])
    sizes = data.get("sizes", [])
    images = data.get("images", [])

    if not isinstance(colours, list):
        colours = []

    if not isinstance(sizes, list):
        sizes = []

    if not isinstance(images, list):
        images = []

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO products (
            name,
            description,
            image,
            images,
            old_price,
            price,
            colours_enabled,
            colours,
            sizes_enabled,
            sizes,
            active,
            category,
            offer_percent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        str(data.get("description", "")),
        str(data.get("image", "")),
        json.dumps(images, ensure_ascii=False),
        old_price,
        price,
        1 if data.get("colours_enabled") else 0,
        json.dumps(colours, ensure_ascii=False),
        1 if data.get("sizes_enabled") else 0,
        json.dumps(sizes, ensure_ascii=False),
        1 if data.get("active", True) else 0,
        str(data.get("category", "General")),
        offer_percent
    ))

    conn.commit()
    product_id = cursor.lastrowid

    row = conn.execute(
        "SELECT * FROM products WHERE id = ?",
        (product_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "success": True,
        "product": product_row(row)
    }), 201


@app.put("/api/products/<int:product_id>")
def update_product(product_id):
    ensure_products_table()

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()

    if not name:
        return jsonify({"error": "Product name is required"}), 400

    try:
        old_price = int(data.get("old_price") or 0)
        price = int(data.get("price") or 0)
        offer_percent = int(data.get("offer_percent") or 0)
    except (TypeError, ValueError):
        return jsonify({"error": "Price and offer must be numbers"}), 400

    colours = data.get("colours", [])
    sizes = data.get("sizes", [])
    images = data.get("images", [])

    if not isinstance(colours, list):
        colours = []

    if not isinstance(sizes, list):
        sizes = []

    if not isinstance(images, list):
        images = []

    conn = get_db()

    cursor = conn.execute("""
        UPDATE products
        SET
            name = ?,
            description = ?,
            image = ?,
            images = ?,
            old_price = ?,
            price = ?,
            colours_enabled = ?,
            colours = ?,
            sizes_enabled = ?,
            sizes = ?,
            active = ?,
            category = ?,
            offer_percent = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (
        name,
        str(data.get("description", "")),
        str(data.get("image", "")),
        json.dumps(images, ensure_ascii=False),
        old_price,
        price,
        1 if data.get("colours_enabled") else 0,
        json.dumps(colours, ensure_ascii=False),
        1 if data.get("sizes_enabled") else 0,
        json.dumps(sizes, ensure_ascii=False),
        1 if data.get("active", True) else 0,
        str(data.get("category", "General")),
        offer_percent,
        product_id
    ))

    conn.commit()

    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    row = conn.execute(
        "SELECT * FROM products WHERE id = ?",
        (product_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "success": True,
        "product": product_row(row)
    })


@app.delete("/api/products/<int:product_id>")
def delete_product(product_id):
    ensure_products_table()

    conn = get_db()

    cursor = conn.execute(
        "DELETE FROM products WHERE id = ?",
        (product_id,)
    )

    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "success": True,
        "product_id": product_id
    })


# Make sure the table exists when Flask starts.
ensure_products_table()


if __name__ == "__main__":
    init_db()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
