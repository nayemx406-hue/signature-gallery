console.log("SG SCRIPT LOADED");

const specialProducts = [
    {
        name: "Signature Product 01",
        description: "Product details coming soon",
        price: 1800,
        image: ""
    },
    {
        name: "Signature Product 02",
        description: "Product details coming soon",
        price: 2200,
        image: ""
    },
    {
        name: "Signature Product 03",
        description: "Product details coming soon",
        price: 2600,
        image: ""
    },
    {
        name: "Signature Product 04",
        description: "Product details coming soon",
        price: 3000,
        image: ""
    }
];

const products = Array.from({ length: 10 }, (_, i) => ({
    name: `Product ${String(i + 1).padStart(2, "0")}`,
    description: "Product details coming soon",
    price: 0,
    image: ""
}));

const allProducts = [...specialProducts, ...products];

let cart = [];

 
function productCard(product, index, type) {
    const badge = type === "special" ? "SPECIAL" : "NEW";

    return `
        <article class="sg-product-card">

            <div class="sg-product-media">
                <span class="sg-product-badge">${badge}</span>

                <div class="sg-product-image">
                    ${
                        product.image
                        ? `<img src="${product.image}" alt="${product.name}">`
                        : `<span>IMAGE COMING SOON</span>`
                    }
                </div>

                <button
                    class="sg-quick-add"
                    onclick="addToCart(${index}, '${type}')"
                >
                    ADD TO CART
                </button>
            </div>

            <div class="sg-product-info">
                <span class="sg-product-category">
                    ${type === "special" ? "SPECIAL COLLECTION" : "SIGNATURE COLLECTION"}
                </span>

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <div class="sg-product-bottom">
                    <strong>৳ ${product.price.toLocaleString()}</strong>

                    <button
                        class="sg-cart-icon"
                        onclick="addToCart(${index}, '${type}')"
                        aria-label="Add ${product.name} to cart"
                    >
                        +
                    </button>
                </div>
            </div>

        </article>
    `;
}

function showProducts() {
    const specialProductList = document.getElementById("specialProducts");
    const productList = document.getElementById("productList");

    if (specialProductList) {
        specialProductList.innerHTML = specialProducts
            .map((product, index) => productCard(product, index, "special"))
            .join("");
    }

    if (productList) {
        productList.innerHTML = products
            .map((product, index) => productCard(product, index, "regular"))
            .join("");
    }
}

function addToCart(index, type = "regular") {
    const product = type === "special"
        ? specialProducts[index]
        : products[index];

    if (!product) return;

    const existing = cart.find(
        item => item.name === product.name
    );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {

        total += item.price * item.quantity;
        count += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">

                <div>
                    <strong>${item.name}</strong>
                    <p>৳ ${item.price.toLocaleString()}</p>
                </div>

                <div class="quantity">
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>

            </div>
        `;
    });

    cartCount.textContent = count;
    cartTotal.textContent = total.toLocaleString();
}

function changeQuantity(index, amount) {

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}

function openCart() {
    document
        .getElementById("cartOverlay")
        .classList.add("active");
}

function closeCart() {
    document
        .getElementById("cartOverlay")
        .classList.remove("active");
}

function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const selected =
        document.querySelector(
            'input[name="delivery"]:checked'
        );

    const delivery =
        selected && selected.value === "outside"
            ? STORE_CONFIG.delivery.outsideSylhet
            : STORE_CONFIG.delivery.insideSylhet;

    document.getElementById("checkoutSubtotal").textContent =
        subtotal.toLocaleString();

    document.getElementById("deliveryCharge").textContent =
        delivery.toLocaleString();

    document.getElementById("checkoutTotal").textContent =
        (subtotal + delivery).toLocaleString();

    closeCart();

    document
        .getElementById("checkoutOverlay")
        .classList.add("active");
}

function updateDelivery() {

    const selected =
        document.querySelector(
            'input[name="delivery"]:checked'
        );

    if (!selected) return;

    const delivery =
        selected.value === "outside"
            ? STORE_CONFIG.delivery.outsideSylhet
            : STORE_CONFIG.delivery.insideSylhet;

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    document.getElementById("deliveryCharge").textContent =
        delivery.toLocaleString();

    document.getElementById("checkoutTotal").textContent =
        (subtotal + delivery).toLocaleString();
}

function closeCheckout() {
    document
        .getElementById("checkoutOverlay")
        .classList.remove("active");
}

function generateOrderId() {

    const now = new Date();

    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const random =
        Math.floor(1000 + Math.random() * 9000);

    return "MY-" + date + "-" + random;
}

function showConfirmation(
    name,
    phone,
    district,
    address,
    delivery,
    total
) {

    const orderId = generateOrderId();

    document.getElementById("orderId").textContent =
        orderId;

    document.getElementById("confirmationDetails").innerHTML = `

        <div class="confirmation-row">
            <span>Customer</span>
            <strong>${name}</strong>
        </div>

        <div class="confirmation-row">
            <span>Phone</span>
            <strong>${phone}</strong>
        </div>

        <div class="confirmation-row">
            <span>District</span>
            <strong>${district}</strong>
        </div>

        <div class="confirmation-row">
            <span>Delivery</span>
            <strong>
                ${delivery === "inside"
                    ? "Inside Sylhet"
                    : "Outside Sylhet"}
            </strong>
        </div>

        <div class="confirmation-row">
            <span>Address</span>
            <strong>${address}</strong>
        </div>

        <div class="confirmation-row total-row">
            <span>Total</span>
            <strong>৳ ${total.toLocaleString()}</strong>
        </div>
    `;

    document
        .getElementById("confirmationOverlay")
        .classList.add("active");
}

function closeConfirmation() {

    document
        .getElementById("confirmationOverlay")
        .classList.remove("active");
}

document
    .getElementById("checkoutForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("customerName").value.trim();

        const phone =
            document.getElementById("customerPhone").value.trim();

        const district =
            document.getElementById("district").value;

        const address =
            document.getElementById("address").value.trim();

        const selected =
            document.querySelector(
                'input[name="delivery"]:checked'
            );

        const deliveryType =
            selected ? selected.value : "inside";

        const delivery =
            deliveryType === "outside"
                ? STORE_CONFIG.delivery.outsideSylhet
                : STORE_CONFIG.delivery.insideSylhet;

        const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const total = subtotal + delivery;

        const order = {
            id: generateOrderId(),
            date: new Date().toISOString(),
            customer: {
                name,
                phone,
                district,
                address
            },
            delivery: deliveryType,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal,
            deliveryCharge: delivery,
            total
        };

        await saveOrder(order);

        closeCheckout();

        showConfirmation(
            name,
            phone,
            district,
            address,
            deliveryType,
            total
        );

        cart = [];

        updateCart();

        this.reset();

        const inside =
            document.querySelector(
                'input[name="delivery"][value="inside"]'
            );

        if (inside) {
            inside.checked = true;
        }
    });

document.addEventListener("DOMContentLoaded", () => {
    console.log("SG DOM READY");
    console.log("specialProducts:", specialProducts.length);
    console.log("products:", products.length);
    console.log("specialProducts element:", document.getElementById("specialProducts"));
    console.log("productList element:", document.getElementById("productList"));
    try {
        showProducts();
        console.log("SIGNATURE GALLERY: Products rendered successfully.");
    } catch (error) {
        console.error("SIGNATURE GALLERY PRODUCT ERROR:", error);
    }

    try {
        updateCart();
    } catch (error) {
        console.error("SIGNATURE GALLERY CART ERROR:", error);
    }
});

async function saveOrder(order) {
    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            order_id: order.id,
            customer_name: order.customer.name,
            phone: order.customer.phone,
            district: order.customer.district,
            address: order.customer.address,
            delivery_type: order.delivery,
            subtotal: order.subtotal,
            delivery_charge: order.deliveryCharge,
            total: order.total
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Order could not be placed");
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    return await response.json();
}

const heroImages = [
"images/banner1.png",
"images/banner2.png",
"images/banner3.png"
];

// heroIndex already declared

function changeHero(){
 const hero = document.querySelector(".hero-image");

 if(!hero) return;

 hero.style.opacity = "0";
 setTimeout(()=>{ 
 hero.style.backgroundImage = `url("${heroImages[heroIndex]}")`;
 hero.style.opacity = "1";
 },500);

 document.querySelectorAll(".hero-dots b").forEach((dot, index) => {
     dot.classList.toggle("active", index === heroIndex);
 });

 heroIndex++;

 if(heroIndex >= heroImages.length){
  heroIndex = 0;
 }
}

changeHero();
setInterval(changeHero,4000);




function showPayment(){
    let payment=document.querySelector('input[name="payment"]:checked').value;

    document.getElementById("bkashBox").style.display =
    payment==="bkash" ? "block":"none";

    document.getElementById("codBox").style.display =
    payment==="cod" ? "block":"none";
}
