const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login.html';
}

const productForm = document.getElementById('productForm');
const productsList = document.getElementById('adminProductsList');

async function checkAdminRole() {
    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (res.status === 403) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '/';
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();

        productsList.innerHTML = "";
        data.products.forEach((product) => {
            productsList.innerHTML += `
                <li class="product-item">
                    <div>
                        <strong>${product.name}</strong>
                        <p>Giá: $${product.price}</p>
                        <p>Còn lại: ${product.stock}</p>
                    </div>
                    <div>
                        <button onclick="editProduct('${product._id}')">Sửa</button>
                        <button onclick="deleteProduct('${product._id}')">Xóa</button>
                    </div>
                </li>`;
        });
    } catch (error) {
        console.error(error);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        image: document.getElementById('image').value
    };

    try {
        const method = productId ? 'PATCH' : 'POST';
        const url = productId ? `/api/products/${productId}` : '/api/products';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });

        if (!res.ok) throw new Error('Lỗi khi lưu sản phẩm');

        productForm.reset();
        document.getElementById('productId').value = '';
        fetchProducts();
        alert('Lưu sản phẩm thành công!');
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function editProduct(id) {
    try {
        const res = await fetch(`/api/products/${id}`);
        const product = await res.json();

        document.getElementById('productId').value = product._id;
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description;
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;
        document.getElementById('image').value = product.image || '';
    } catch (error) {
        console.error(error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Lỗi khi xóa sản phẩm');

        fetchProducts();
        alert('Xóa sản phẩm thành công!');
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

checkAdminRole();
fetchProducts();
productForm.addEventListener('submit', handleProductSubmit);
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});
