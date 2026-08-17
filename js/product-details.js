let selectedColour = "Black";
let selectedSize = "M";
let productQuantity = 1;

const productPrice = 999;

const colourImages = {
    Black: "images/products/product-01-1.png",
    White: "images/products/product-01-2.png"
};

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

    const image = colourImages[colour];

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
    const total = productPrice * productQuantity;

    const price = document.getElementById("productPrice");
    const totalElement = document.getElementById("productTotal");

    if (price) {
        price.textContent = productPrice.toLocaleString();
    }

    if (totalElement) {
        totalElement.textContent = total.toLocaleString();
    }
}

function getProductImage() {
    return colourImages[selectedColour] || "images/products/product-01-1.png";
}

function createProductItem() {
    return {
        name: "U.S. Polo Style Premium Baggy Joggers",
        description:
            `U.S. Polo Style Premium Baggy Joggers | ${selectedColour} | Size ${selectedSize}`,
        price: productPrice,
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
