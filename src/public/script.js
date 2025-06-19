const productsList = document.getElementById("productsList");

const search = document.getElementById("search");

const searchBtn = document.getElementById("searchBtn");

let cart = [];
let token = localStorage.getItem('token'); 

if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}

async function fetchProducts(s) {
    try {
        let url = "/api/products";

        if (s) {
            url += "?search=" + encodeURIComponent(s);
        }

        const res = await fetch(url);
        const data = await res.json();

        productsList.innerHTML = "";
        data.products.forEach((item) => {
            productsList.innerHTML += `
                <li class="product-item">
                    <strong>${item.name}</strong> $${item.price}
                    <button onclick="addToCart('${item._id}', 1)">
                        Thêm vào giỏ
                    </button>
                </li>`;
        });
    } catch (error) {
        console.error(error);
    }
}

async function addToCart(productId, quantity) {
    if (!token) {
        alert('Vui lòng đăng nhập để thêm vào giỏ!');
        return;
    }

    try {
        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        if (!res.ok) {
            throw new Error('Lỗi khi thêm vào giỏ');
        }

        await fetchCart(); 
        alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function fetchCart() {
    if (!token) return;

    try {
        const res = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        updateCartDisplay(data);
    } catch (error) {
        console.error(error);
    }
}

async function removeFromCart(itemId) {
    try {
        const res = await fetch(`/api/cart/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Lỗi khi xóa khỏi giỏ');
        }

        await fetchCart(); 
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function updateCartDisplay(cart) {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    
    cartItems.innerHTML = "";
    let total = 0;
    
    cart.items.forEach(item => {
        const product = item.productId;
        total += product.price * item.quantity;
        cartItems.innerHTML += `
            <li>
                ${product.name} x ${item.quantity} - $${product.price * item.quantity}
                <button onclick="removeFromCart('${item._id}')">Xóa</button>
            </li>`;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
        token = e.newValue;
        if (token) {
            fetchCart();
        }
    }
});

fetchCart();

searchBtn.addEventListener("click", () => {
    fetchProducts(search.value.trim()); 
});

fetchProducts();

async function checkout() {
    if (!token) {
        alert('Vui lòng đăng nhập để thanh toán!');
        return;
    }

    try {
        const cartRes = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const cartData = await cartRes.json();

        const items = cartData.items.map(item => ({
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity
        }));

        const res = await fetch('/api/payment/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items })
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url; 
        } else {
            alert("Không tạo được phiên thanh toán!");
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi checkout!");
    }
}

document.getElementById("checkoutBtn").addEventListener("click", checkout);

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('logoutBtn').addEventListener('click', logout);

async function checkUserRole() {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin.html';
            adminLink.className = 'btn';
            adminLink.textContent = 'Admin Panel';
            document.querySelector('.header').insertBefore(
                adminLink, 
                document.getElementById('logoutBtn')
            );
        }
    } catch (error) {
        console.error(error);
    }
}

checkUserRole();

