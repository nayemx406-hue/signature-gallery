console.log("SG SCRIPT LOADED");

const specialProducts = [
    {
        name: "Signature Product 01",
        description: "Premium US Polo Collection",
        price: 999,
        image: "images/products/product-01-1.png"
    },
    {
        name: "Signature Product 02",
        description: "Premium T Shirt Collection",
        price: 799,
        image: "images/products/product-02/product-02-main.png"
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
        <article class="sg-product-card" onclick="openProductDetails(${index}, '${type}')">

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

function openProductDetails(index, type = "regular") {
    localStorage.setItem(
        "selectedProduct",
        JSON.stringify({
            index,
            type
        })
    );

    window.location.href =
        `product-details.html?type=${type}&index=${index}`;
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
                upazila,
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

        const district = document.getElementById("district").value;

        const upazila = document.getElementById("upazila").value;

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
                upazila,
                address
            },
            delivery: deliveryType,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                colour: item.colour || "",
                size: item.size || ""
            })),
            subtotal,
            deliveryCharge: delivery,
            total,
            paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || "",
            paymentNumber: document.getElementById("paymentNumber")?.value || "",
            transactionId: document.getElementById("trxId")?.value || ""
        };

        await saveOrder(order);

        closeCheckout();

        showConfirmation(
            name,
            phone,
            district,
                upazila,
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


function importSelectedProduct() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("productAdded") !== "1") return;

    const raw = localStorage.getItem("selectedProduct");
    if (!raw) return;

    try {
        const product = JSON.parse(raw);

        const existing = cart.find(item =>
            item.name === product.name &&
            item.colour === product.colour &&
            item.size === product.size
        );

        if (existing) {
            existing.quantity += product.quantity;
        } else {
            cart.push(product);
        }

        localStorage.removeItem("selectedProduct");

        updateCart();

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        openCart();

    } catch (error) {
        console.error("PRODUCT IMPORT ERROR:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("=== SG DEBUG ===");
    console.log("FORCED PRODUCT RENDER START");
    console.log("specialProducts:", specialProducts);
    console.log("products:", products);
    console.log("special element:", document.getElementById("specialProducts"));
    console.log("regular element:", document.getElementById("productList"));


    console.log("SG DOM READY");
    console.log("specialProducts:", specialProducts.length);
    console.log("products:", products.length);
    console.log("specialProducts element:", document.getElementById("specialProducts"));
    showProducts();
    console.log("SPECIAL HTML LENGTH:", document.getElementById("specialProducts")?.innerHTML.length);
    console.log("REGULAR HTML LENGTH:", document.getElementById("productList")?.innerHTML.length);

    console.log("productList element:", document.getElementById("productList"));
    try {
        showProducts();
        importSelectedProduct();
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
                upazila,
            address: order.customer.address,
            delivery_type: order.delivery,
            subtotal: order.subtotal,
            delivery_charge: order.deliveryCharge,
            total: order.total,
            payment_method: order.paymentMethod,
            payment_number: order.paymentNumber,
            transaction_id: order.transactionId,
            items: order.items
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


const locationData = {
    "Barishal": {
        "Barguna": [
            "Amtali",
            "Bamna",
            "Barguna Sadar",
            "Betagi",
            "Patharghata",
            "Taltali"
        ],
        "Barishal": [
            "Agailjhara",
            "Babuganj",
            "Bakerganj",
            "Banaripara",
            "Barishal Sadar (Kotwali)",
            "Gaurnadi",
            "Hijla",
            "Mehendiganj",
            "Muladi",
            "Wazirpur"
        ],
        "Bhola": [
            "Bhola Sadar",
            "Borhanuddin",
            "Charfasson",
            "Daulatkhan",
            "Lalmohan",
            "Monpura",
            "Tazumuddin"
        ],
        "Jhalokati": [
            "Jhalokati Sadar",
            "Kanthalia",
            "Nalchity",
            "Rajapur"
        ],
        "Patuakhali": [
            "Bauphal",
            "Dashmina",
            "Dumki",
            "Galachipa",
            "Kalapara",
            "Mirzaganj",
            "Patuakhali Sadar",
            "Rangabali"
        ],
        "Pirojpur": [
            "Bhandaria",
            "Indurkani",
            "Kawkhali",
            "Mathbaria",
            "Nazirpur",
            "Nesarabad (Swarupkathi)",
            "Pirojpur Sadar"
        ]
    },
    "Chattogram": {
        "Bandarban": [
            "Alikadam",
            "Bandarban Sadar",
            "Lama",
            "Naikkhongchhari",
            "Rowangchhari",
            "Ruma",
            "Thanchi"
        ],
        "Brahmanbaria": [
            "Akhaura",
            "Ashuganj",
            "Banchharampur",
            "Bijoynagar",
            "Brahmanbaria Sadar",
            "Kasba",
            "Nabinagar",
            "Nasirnagar",
            "Sarail"
        ],
        "Chandpur": [
            "Chandpur Sadar",
            "Faridganj",
            "Haimchar",
            "Hajiganj",
            "Kachua",
            "Matlab Dakkhin",
            "Matlab Uttar",
            "Shahrasti"
        ],
        "Chattogram": [
            "Anwara",
            "Banshkhali",
            "Boalkhali",
            "Chandanaish",
            "Fatikchhari",
            "Hathazari",
            "Karnaphuli",
            "Lohagara",
            "Mirsarai",
            "Patiya",
            "Rangunia",
            "Raozan",
            "Sandwip",
            "Satkania",
            "Sitakunda"
        ],
        "Cumilla": [
            "Adarsha Sadar",
            "Barura",
            "Brahmanpara",
            "Burichang",
            "Chandina",
            "Chauddagram",
            "Daudkandi",
            "Debidwar",
            "Homna",
            "Laksam",
            "Lalmai",
            "Manoharganj",
            "Meghna",
            "Muradnagar",
            "Nangalkot",
            "Sadar Dakkhin",
            "Titas"
        ],
        "Cox's Bazar": [
            "Chakaria",
            "Cox's Bazar Sadar",
            "Eidgaon",
            "Kutubdia",
            "Maheshkhali",
            "Pekua",
            "Ramu",
            "Teknaf",
            "Ukhia"
        ],
        "Feni": [
            "Chhagalnaiya",
            "Daganbhuiyan",
            "Feni Sadar",
            "Fulgazi",
            "Parashuram",
            "Sonagazi"
        ],
        "Khagrachhari": [
            "Dighinala",
            "Guimara",
            "Khagrachhari Sadar",
            "Lakkhichhari",
            "Mahalchhari",
            "Manikchhari",
            "Matiranga",
            "Panchhari",
            "Ramgarh"
        ],
        "Lakshmipur": [
            "Kamalnagar",
            "Lakshmipur Sadar",
            "Raipur",
            "Ramganj",
            "Ramgati"
        ],
        "Noakhali": [
            "Begumganj",
            "Chatkhil",
            "Companiganj",
            "Hatiya",
            "Kabirhat",
            "Noakhali Sadar",
            "Senbag",
            "Sonaimuri",
            "Subarnachar"
        ],
        "Rangamati": [
            "Baghaichhari",
            "Barkal",
            "Belaichhari",
            "Jurachhari",
            "Kaptai",
            "Kawkhali",
            "Langadu",
            "Naniarchar",
            "Rajasthali",
            "Rangamati Sadar"
        ]
    },
    "Dhaka": {
        "Dhaka": [
            "Dhamrai",
            "Dohar",
            "Keraniganj",
            "Nawabganj",
            "Savar"
        ],
        "Faridpur": [
            "Alfadanga",
            "Bhanga",
            "Boalmari",
            "Char Bhadrasan",
            "Faridpur Sadar",
            "Madhukhali",
            "Nagarkanda",
            "Sadarpur",
            "Saltha"
        ],
        "Gazipur": [
            "Gazipur Sadar",
            "Kaliakair",
            "Kaliganj",
            "Kapasia",
            "Sreepur"
        ],
        "Gopalganj": [
            "Gopalganj Sadar",
            "Kashiani",
            "Kotalipara",
            "Muksudpur",
            "Tungipara"
        ],
        "Kishoreganj": [
            "Austagram",
            "Bajitpur",
            "Bhairab",
            "Hossainpur",
            "Itna",
            "Karimganj",
            "Katiadi",
            "Kishoreganj Sadar",
            "Kuliarchar",
            "Mithamain",
            "Nikli",
            "Pakundia",
            "Tarail"
        ],
        "Madaripur": [
            "Dasar",
            "Kalkini",
            "Madaripur Sadar",
            "Rajoir",
            "Shibchar"
        ],
        "Manikganj": [
            "Daulatpur",
            "Ghior",
            "Harirampur",
            "Manikganj Sadar",
            "Saturia",
            "Shibalay",
            "Singair"
        ],
        "Munshiganj": [
            "Gazaria",
            "Louhajang",
            "Munshiganj Sadar",
            "Sirajdikhan",
            "Sreenagar",
            "Tongibari"
        ],
        "Narayanganj": [
            "Araihazar",
            "Bandar",
            "Narayanganj Sadar",
            "Rupganj",
            "Sonargaon"
        ],
        "Narsingdi": [
            "Belabo",
            "Manohardi",
            "Narsingdi Sadar",
            "Palash",
            "Raipura",
            "Shibpur"
        ],
        "Rajbari": [
            "Baliakandi",
            "Goalanda",
            "Kalukhali",
            "Pangsha",
            "Rajbari Sadar"
        ],
        "Shariatpur": [
            "Bhedarganj",
            "Damudya",
            "Gosairhat",
            "Naria",
            "Shariatpur Sadar",
            "Zajira"
        ],
        "Tangail": [
            "Basail",
            "Bhuapur",
            "Delduar",
            "Dhanbari",
            "Ghatail",
            "Gopalpur",
            "Kalihati",
            "Madhupur",
            "Mirzapur",
            "Nagarpur",
            "Sakhipur",
            "Tangail Sadar"
        ]
    },
    "Khulna": {
        "Bagerhat": [
            "Bagerhat Sadar",
            "Chitalmari",
            "Fakirhat",
            "Kachua",
            "Mollahat",
            "Mongla",
            "Morelganj",
            "Rampal",
            "Sharankhola"
        ],
        "Chuadanga": [
            "Alamdanga",
            "Chuadanga Sadar",
            "Damurhuda",
            "Jibannagar"
        ],
        "Jashore": [
            "Abhaynagar",
            "Bagharpara",
            "Chaugachha",
            "Jashore Sadar",
            "Jhikargachha",
            "Keshabpur",
            "Manirampur",
            "Sharsha"
        ],
        "Jhenaidah": [
            "Harinakundu",
            "Jhenaidah Sadar",
            "Kaliganj",
            "Kotchandpur",
            "Maheshpur",
            "Shailkupa"
        ],
        "Khulna": [
            "Batiaghata",
            "Dacope",
            "Dighalia",
            "Dumuria",
            "Koyra",
            "Paikgachha",
            "Phultala",
            "Rupsa",
            "Terokhada"
        ],
        "Kushtia": [
            "Bheramara",
            "Daulatpur",
            "Khoksa",
            "Kumarkhali",
            "Kushtia Sadar",
            "Mirpur"
        ],
        "Magura": [
            "Magura Sadar",
            "Mohammadpur",
            "Shalikha",
            "Sreepur"
        ],
        "Meherpur": [
            "Gangni",
            "Meherpur Sadar",
            "Mujibnagar"
        ],
        "Narail": [
            "Kalia",
            "Lohagara",
            "Narail Sadar"
        ],
        "Satkhira": [
            "Ashashuni",
            "Debhata",
            "Kalaroa",
            "Kaliganj",
            "Satkhira Sadar",
            "Shyamnagar",
            "Tala"
        ]
    },
    "Mymensingh": {
        "Jamalpur": [
            "Bakshiganj",
            "Dewanganj",
            "Islampur",
            "Jamalpur Sadar",
            "Madarganj",
            "Melandaha",
            "Sarishabari"
        ],
        "Mymensingh": [
            "Bhaluka",
            "Dhobaura",
            "Fulbaria",
            "Fulpur",
            "Gafargaon",
            "Gouripur",
            "Haluaghat",
            "Ishwarganj",
            "Muktagachha",
            "Mymensingh Sadar",
            "Nandail",
            "Tarakanda",
            "Trishal"
        ],
        "Netrakona": [
            "Atpara",
            "Barhatta",
            "Durgapur",
            "Kalmakanda",
            "Kendua",
            "Khaliajuri",
            "Madan",
            "Mohanganj",
            "Netrakona Sadar",
            "Purbadhala"
        ],
        "Sherpur": [
            "Jhenaigati",
            "Nakla",
            "Nalitabari",
            "Sherpur Sadar",
            "Sreebardi"
        ]
    },
    "Rajshahi": {
        "Bogura": [
            "Adamdighi",
            "Bogura Sadar",
            "Dhunat",
            "Dupchachia",
            "Gabtali",
            "Kahaloo",
            "Nandigram",
            "Sariakandi",
            "Shajahanpur",
            "Sherpur",
            "Shibganj",
            "Sonatala"
        ],
        "Joypurhat": [
            "Akkelpur",
            "Joypurhat Sadar",
            "Kalai",
            "Khetlal",
            "Panchbibi"
        ],
        "Naogaon": [
            "Atrai",
            "Badalgachhi",
            "Dhamoirhat",
            "Mahadebpur",
            "Manda",
            "Naogaon Sadar",
            "Niamatpur",
            "Patnitala",
            "Porsha",
            "Raninagar",
            "Sapahar"
        ],
        "Natore": [
            "Bagatipara",
            "Baraigram",
            "Gurudaspur",
            "Lalpur",
            "Naldanga",
            "Natore Sadar",
            "Singra"
        ],
        "Chapainawabganj": [
            "Bholahat",
            "Chapainawabganj Sadar",
            "Gomastapur",
            "Nachole",
            "Shibganj"
        ],
        "Pabna": [
            "Atgharia",
            "Bera",
            "Bhangura",
            "Chatmohar",
            "Faridpur",
            "Ishwardi",
            "Pabna Sadar",
            "Santhia",
            "Sujanagar"
        ],
        "Rajshahi": [
            "Bagha",
            "Bagmara",
            "Charghat",
            "Durgapur",
            "Godagari",
            "Mohanpur",
            "Paba",
            "Puthia",
            "Tanore"
        ],
        "Sirajganj": [
            "Belkuchi",
            "Chouhali",
            "Kamarkhanda",
            "Kazipur",
            "Rayganj",
            "Shahjadpur",
            "Sirajganj Sadar",
            "Tarash",
            "Ullapara"
        ]
    },
    "Rangpur": {
        "Dinajpur": [
            "Birampur",
            "Birganj",
            "Birol",
            "Bochaganj",
            "Chirirbandar",
            "Dinajpur Sadar",
            "Fulbari",
            "Ghoraghat",
            "Hakimpur",
            "Kaharole",
            "Khansama",
            "Nababganj",
            "Parbatipur"
        ],
        "Gaibandha": [
            "Fulchhari",
            "Gaibandha Sadar",
            "Gobindaganj",
            "Palashbari",
            "Sadullapur",
            "Saghata",
            "Sundarganj"
        ],
        "Kurigram": [
            "Bhurungamari",
            "Chilmari",
            "Kurigram Sadar",
            "Nageshwari",
            "Phulbari",
            "Rajarhat",
            "Rajibpur",
            "Roumari",
            "Ulipur"
        ],
        "Lalmonirhat": [
            "Aditmari",
            "Hatibandha",
            "Kaliganj",
            "Lalmonirhat Sadar",
            "Patgram"
        ],
        "Nilphamari": [
            "Dimla",
            "Domar",
            "Jaldhaka",
            "Kishoreganj",
            "Nilphamari Sadar",
            "Saidpur"
        ],
        "Panchagarh": [
            "Atowari",
            "Boda",
            "Debiganj",
            "Panchagarh Sadar",
            "Tetulia"
        ],
        "Rangpur": [
            "Badarganj",
            "Gangachara",
            "Kaunia",
            "Mithapukur",
            "Pirgachha",
            "Pirganj",
            "Rangpur Sadar",
            "Taraganj"
        ],
        "Thakurgaon": [
            "Baliadangi",
            "Haripur",
            "Pirganj",
            "Ranishankail",
            "Thakurgaon Sadar"
        ]
    },
    "Sylhet": {
        "Habiganj": [
            "Ajmiriganj",
            "Bahubal",
            "Baniachong",
            "Chunarughat",
            "Habiganj Sadar",
            "Lakhai",
            "Madhabpur",
            "Nabiganj",
            "Shayestaganj"
        ],
        "Moulvibazar": [
            "Baralekha",
            "Juri",
            "Kamalganj",
            "Kulaura",
            "Moulvibazar Sadar",
            "Rajnagar",
            "Sreemangal"
        ],
        "Sunamganj": [
            "Bishwambharpur",
            "Chhatak",
            "Derai",
            "Dharmapasha",
            "Dowarabazar",
            "Jagannathpur",
            "Jamalganj",
            "Madhyanagar",
            "Shalla",
            "Shantiganj",
            "Sunamganj Sadar",
            "Tahirpur"
        ],
        "Sylhet": [
            "Balaganj",
            "Beanibazar",
            "Bishwanath",
            "Companiganj",
            "Dakkhin Surma",
            "Fenchuganj",
            "Golapganj",
            "Gowainghat",
            "Jaintapur",
            "Kanaighat",
            "Osmaninagar",
            "Sylhet Sadar",
            "Zakiganj"
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const divisionSelect = document.getElementById("division");
    const districtSelect = document.getElementById("district");
    const upazilaSelect = document.getElementById("upazila");

    if (!divisionSelect || !districtSelect || !upazilaSelect) return;

    divisionSelect.onchange = function () {

        districtSelect.innerHTML =
            '<option value="">Select District</option>';

        upazilaSelect.innerHTML =
            '<option value="">Select Upazila</option>';

        const districts = locationData[this.value];

        if (!districts) return;

        Object.keys(districts).forEach(function (districtName) {

            const option = document.createElement("option");
            option.value = districtName;
            option.textContent = districtName;

            districtSelect.appendChild(option);
        });
    };

    districtSelect.onchange = function () {

        upazilaSelect.innerHTML =
            '<option value="">Select Upazila</option>';

        const divisionName = divisionSelect.value;
        const districtName = this.value;

        const upazilas =
            locationData[divisionName]?.[districtName];

        if (!upazilas) return;

        upazilas.forEach(function (upazilaName) {

            const option = document.createElement("option");
            option.value = upazilaName;
            option.textContent = upazilaName;

            upazilaSelect.appendChild(option);
        });
    };

    console.log("LOCATION SELECTORS READY");
});

