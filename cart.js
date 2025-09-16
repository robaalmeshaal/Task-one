function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const productDiv = e.target.closest(".swiper-slide.box");
        const id = productDiv.dataset.id;
        const image=productDiv.dataset.img;
        const name = productDiv.dataset.name;
        const price = parseFloat(productDiv.dataset.price);

        let cart = getCart();
        const existing = cart.find(p => p.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, image, name, price, quantity: 1 });
        }
        saveCart(cart);
        alert(`${name} added to cart!`);
    });
});