let currentProduct = {
    name: "U.S. Polo Style Premium Baggy Joggers",
    price: 999,
    oldPrice: 1399,
    description: "স্টাইলিশ লুক, আরামদায়ক ফিট ও প্রিমিয়াম ফিনিশিং— সব একসাথে। ✨",
    gallery: [
        "images/products/product-01-1.png",
        "images/products/product-01-2.png",
        "images/products/product-01-3.png",
        "images/products/product-01-4.png"
    ]
};

function loadSelectedProduct() {
    const saved = JSON.parse(localStorage.getItem("selectedProduct") || "{}");

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");

    if (productId === "2") {
        saved.type = "special";
        saved.index = 1;
        
    }

    if (saved.type === "special" && saved.index === 1) {
        currentProduct = {
            name: "✨ Premium China Fabric T-Shirt | প্রিমিয়াম চায়না ফ্যাব্রিক টি-শার্ট ✨",
            price: 799,
            oldPrice: 1199,
            description: `✨ Premium China Fabric T-Shirt | প্রিমিয়াম চায়না ফ্যাব্রিক টি-শার্ট ✨

Upgrade your casual style with our Premium China Fabric T-Shirt — made for comfort, smooth feel & modern fashion.

আপনার ক্যাজুয়াল লুককে আরও স্টাইলিশ করুন আমাদের প্রিমিয়াম চায়না ফ্যাব্রিক টি-শার্টের সাথে — যেখানে আছে আরাম, মসৃণ অনুভূতি ও আধুনিক ডিজাইন।

👕 Premium Fabric | উন্নতমানের ফ্যাব্রিক
🔥 Key Features:
✔ Smooth & Soft Feel
✔ Stylish Modern Look
✔ Comfortable Fit
✔ Easy to Wear
✔ Premium Finishing

🎨 Perfect for:
Casual • Outdoor • Daily Wear

📦 Fast Delivery Available

🛒 Order Now & Feel The Comfort`,
            gallery: [
                "images/products/product-02/product-02-main.png",
                "images/products/product-02/product-02-1.png",
                "images/products/product-02/product-02-2.png",
                "images/products/product-02/product-02-3.png"
            ]
        };
    }

    const name = document.getElementById("productName");
    const price = document.getElementById("productPrice");
    const oldPrice = document.getElementById("oldPrice");
    const main = document.getElementById("mainProductImage");
    const description = document.getElementById("productDescription");

    if (name) name.textContent = currentProduct.name;
    if (price) price.textContent = currentProduct.price;
    if (oldPrice && currentProduct.oldPrice) oldPrice.textContent = "৳" + currentProduct.oldPrice;
    if (main) main.src = currentProduct.gallery[0];
    if (description) description.textContent = currentProduct.description;

    const fullDescription = document.getElementById("fullProductDescription");
    if (fullDescription) {
        fullDescription.innerHTML = currentProduct.description
            .replace(/\n/g, "<br>");
    }

    const thumbnails = document.getElementById("productThumbnails");

    if (thumbnails) {
        thumbnails.innerHTML = currentProduct.gallery.map((img, i) => `
            <button
                type="button"
                class="thumbnail ${i === 0 ? "active" : ""}"
                onclick="changeProductImage('${img}', this)"
            >
                <img src="${img}" alt="Product image ${i + 1}">
            </button>
        `).join("");
    }
}

let selectedColour = "Black";
let selectedSize = "M";
let productQuantity = 1;

const productPrice = currentProduct.price;

function getColourImages(){
    return {
        Black: currentProduct.gallery[0],
        White: currentProduct.gallery[1]
    };
}

function changeProductImage(image, button = null) {
    const main = document.getElementById("mainProductImage");

    if (main) {
        main.src = image;
    }

    document
        .querySelectorAll(".product-thumbnails .thumbnail")
        .forEach(btn => btn.classList.remove("active"));

    if (button) {
        button.classList.add("active");
    }
}

function selectColour(button, colour) {
    selectedColour = colour;

    document
        .querySelectorAll(".colour-option")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    const selected = document.getElementById("selectedColour");

    if (selected) {
        selected.textContent = colour;
    }

    const image = getColourImages()[colour];

    if (image) {
        changeProductImage(image);
    }
}

function selectSize(button, size) {
    selectedSize = size;

    document
        .querySelectorAll(".size-option")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    const selected = document.getElementById("selectedSize");

    if (selected) {
        selected.textContent = size;
    }
}

function changeProductQuantity(amount) {
    productQuantity += amount;

    if (productQuantity < 1) {
        productQuantity = 1;
    }

    const quantity = document.getElementById("productQuantity");

    if (quantity) {
        quantity.textContent = productQuantity;
    }

    updateProductTotal();
}

function updateProductTotal() {
    const total = currentProduct.price * productQuantity;

    const price = document.getElementById("productPrice");
    const totalElement = document.getElementById("productTotal");

    if (price) {
        price.textContent = currentProduct.price.toLocaleString();
    }

    if (totalElement) {
        totalElement.textContent = total.toLocaleString();
    }
}

function getProductImage() {
    return getColourImages()[selectedColour] || currentProduct.gallery[0];
}

function createProductItem() {
    return {
        name: currentProduct.name,
        description:
            `${currentProduct.name} | ${selectedColour} | Size ${selectedSize}`,
        price: currentProduct.price,
        image: getProductImage(),
        colour: selectedColour,
        size: selectedSize,
        quantity: productQuantity
    };
}

function addProductToCart() {
    const item = createProductItem();

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(item)
    );

    window.location.href = "index.html?productAdded=1";
}

function orderNow() {
    const item = createProductItem();

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(item)
    );

    /*
     * Existing index.html + script.js will import the
     * selected product and automatically open the cart.
     * From there the existing checkout system is used.
     */
    window.location.href = "index.html?productAdded=1";
}

function updateProductCartCount() {
    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    let count = 0;

    try {
        const savedCart =
            JSON.parse(localStorage.getItem("productCart") || "[]");

        if (Array.isArray(savedCart)) {
            count = savedCart.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0
            );
        }
    } catch (error) {
        console.error("CART COUNT ERROR:", error);
    }

    cartCount.textContent = count;
}

function goToShopCart() {
    window.location.href = "index.html#shop";
}

/* IMAGE LIGHTBOX */

function openImagePreview() {
    const main = document.getElementById("mainProductImage");
    const lightbox = document.getElementById("imageLightbox");
    const lightboxImage = document.getElementById("lightboxImage");

    if (!main || !lightbox || !lightboxImage) return;

    lightboxImage.src = main.src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeImagePreview() {
    const lightbox = document.getElementById("imageLightbox");

    if (!lightbox) return;

    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
    loadSelectedProduct();

    updateProductTotal();
    updateProductCartCount();

    const mainImageBox =
        document.getElementById("productImageBox");

    if (mainImageBox) {
        mainImageBox.addEventListener(
            "click",
            openImagePreview
        );
    }

    const lightbox =
        document.getElementById("imageLightbox");

    if (lightbox) {
        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) {
                closeImagePreview();
            }
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeImagePreview();
        }
    });
});


function checkColourBox() {
    if (currentProduct && currentProduct.name.includes("Premium China Fabric T-Shirt")) {
        const box = document.querySelector("#colourBoxWrapper");
        if (box) box.style.display = "none";
    }
}

setTimeout(checkColourBox, 500);
