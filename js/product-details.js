let selectedColour = "White";
let selectedSize = "M";
let productQuantity = 1;

const productPrice = 999;

function changeProductImage(image) {
    const main = document.getElementById("mainProductImage");

    if (main) {
        main.src = image;
    }
}

function selectColour(button, colour) {
    selectedColour = colour;

    document
        .querySelectorAll(".colour-option")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    if (colour === "Black") {
        changeProductImage("images/products/product-01-4.png");
    } else {
        changeProductImage("images/products/product-01-1.png");
    }
}

function selectSize(button, size) {
    selectedSize = size;

    document
        .querySelectorAll(".size-option")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");
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
}

function addProductToCart() {
    const item = {
        name: "Signature Product 01",
        description: `US Polo | ${selectedColour} | Size ${selectedSize}`,
        price: productPrice,
        image: selectedColour === "Black"
            ? "images/products/product-01-4.png"
            : "images/products/product-01-1.png",
        colour: selectedColour,
        size: selectedSize,
        quantity: productQuantity
    };

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(item)
    );

    window.location.href = "index.html?productAdded=1";
}

function updateProductCartCount() {
    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    const cart =
        JSON.parse(localStorage.getItem("productCart") || "[]");

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = count;
}

function orderNow() {
    addProductToCart();

    window.location.href = "index.html#shop";
}

function goToShopCart() {
    window.location.href = "index.html#shop";
}

document.addEventListener("DOMContentLoaded", () => {
    updateProductCartCount();

    const defaultSize =
        document.querySelector(".size-option");

    if (defaultSize) {
        defaultSize.classList.add("active");
    }
});
