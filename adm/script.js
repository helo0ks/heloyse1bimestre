document.addEventListener('DOMContentLoaded', async () => {
    const userList = document.getElementById('user-list');
    let currentUser = null;

    // Verifica se quem está acessando é um admin
    try {
        const authResponse = await fetch('http://localhost:3001/check-auth', { credentials: 'include' });
        const authData = await authResponse.json();
        if (!authData.loggedIn || authData.user.role !== 'admin') {
            alert('Acesso negado.');
            window.location.href = '../proj/pedido.html'; // Redireciona se não for admin
            return;
        }
        currentUser = authData.user;
        loadUsers();
    } catch (error) {
        window.location.href = '../proj/pedido.html';
    }

    // Carrega e exibe a lista de usuários
    function loadUsers() {
        fetch('http://localhost:3001/users', { credentials: 'include' })
            .then(res => res.json())
            .then(users => {
                userList.innerHTML = '';
                users.forEach(user => {
                    const li = document.createElement('li');
                    li.className = 'user-item';
                    li.dataset.userId = user.id;

                    // Não permite alterar/excluir o próprio usuário
                    const isSelf = user.id === currentUser.id;

                    li.innerHTML = `
                        <span>${user.username}</span>
                        <div>
                            <select ${isSelf ? 'disabled' : ''}>
                                <option value="cliente" ${user.role === 'cliente' ? 'selected' : ''}>Cliente</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                            <button class="delete-user-btn" ${isSelf ? 'disabled' : ''}>Excluir</button>
                        </div>
                    `;
                    userList.appendChild(li);
                });
            });
    }

    // Event listener para as ações de alterar papel ou excluir
    userList.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT') {
            const userId = e.target.closest('.user-item').dataset.userId;
            const newRole = e.target.value;
            fetch(`http://localhost:3001/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            })
            .then(res => res.json())
            .then(data => alert(data.message));
        }
    });

    userList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-user-btn')) {
             if(confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) {
                const userId = e.target.closest('.user-item').dataset.userId;
                fetch(`http://localhost:3001/users/${userId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                }).then(res => {
                    if (res.ok) {
                        alert('Usuário excluído com sucesso.');
                        loadUsers(); // Recarrega a lista
                    } else {
                        res.json().then(data => alert(`Erro: ${data.message}`));
                    }
                });
            }
        }
    });
});