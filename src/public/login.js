document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.accessToken);
            window.location.href = '/index.html';
        } else {
            alert(data.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error(error);
        alert('Lỗi khi đăng nhập');
    }
});
