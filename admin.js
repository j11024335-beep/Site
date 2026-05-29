import { db, auth, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase.js';

// Estado Global
let currentView = 'dashboard';

// Autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        initAdmin();
    } else {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('hidden');
    }
});

// Navegação
window.showView = (view) => {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${view}-view`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    currentView = view;
};

// Inicialização
function initAdmin() {
    loadDashboard();
    listenOrders();
    listenProducts();
    listenCategories();
    loadSettings();
}

// DASHBOARD
async function loadDashboard() {
    onSnapshot(collection(db, "orders"), (snap) => {
        document.getElementById('stat-orders').innerText = snap.size;
        let total = 0;
        snap.forEach(doc => total += (doc.data().total || 0));
        document.getElementById('stat-sales').innerText = `R$ ${total.toFixed(2)}`;
    });
    
    onSnapshot(collection(db, "products"), (snap) => {
        document.getElementById('stat-products').innerText = snap.size;
    });
}

// PEDIDOS (Tempo Real)
function listenOrders() {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const order = doc.data();
            const statusClass = `badge-${order.status || 'pending'}`;
            tbody.innerHTML += `
                <tr>
                    <td>#${doc.id.slice(0,5)}</td>
                    <td>${order.customerName}</td>
                    <td>R$ ${order.total.toFixed(2)}</td>
                    <td><span class="badge ${statusClass}">${getStatusLabel(order.status)}</span></td>
                    <td>
                        <select onchange="updateOrderStatus('${doc.id}', this.value)" class="form-control form-control-sm">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparando</option>
                            <option value="delivery" ${order.status === 'delivery' ? 'selected' : ''}>Saiu p/ Entrega</option>
                            <option value="done" ${order.status === 'done' ? 'selected' : ''}>Concluído</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    });
}

function getStatusLabel(status) {
    const labels = { pending: 'Pendente', preparing: 'Preparando', delivery: 'Em Entrega', done: 'Concluído' };
    return labels[status] || 'Pendente';
}

window.updateOrderStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status atualizado', showConfirmButton: false, timer: 2000 });
};

// PRODUTOS
function listenProducts() {
    onSnapshot(collection(db, "products"), (snapshot) => {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const p = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td><img src="${p.image}" width="40" style="border-radius: 4px"></td>
                    <td>${p.name}</td>
                    <td>R$ ${p.price.toFixed(2)}</td>
                    <td>${p.categoryName || 'S/ Cat'}</td>
                    <td>
                        <button onclick="deleteItem('products', '${doc.id}')" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    });
}

// CATEGORIAS
function listenCategories() {
    onSnapshot(collection(db, "categories"), (snapshot) => {
        const tbody = document.getElementById('categories-table-body');
        const select = document.getElementById('p-category');
        tbody.innerHTML = '';
        select.innerHTML = '<option value="">Selecionar Categoria</option>';
        
        snapshot.forEach(doc => {
            const c = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td>${c.name}</td>
                    <td><button onclick="deleteItem('categories', '${doc.id}')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
            select.innerHTML += `<option value="${doc.id}">${c.name}</option>`;
        });
    });
}

window.saveCategory = async (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;
    await addDoc(collection(db, "categories"), { name });
    e.target.reset();
    Swal.fire('Sucesso', 'Categoria criada', 'success');
};

// CONFIGURAÇÕES
async function loadSettings() {
    const docSnap = await getDocs(collection(db, "settings"));
    docSnap.forEach(d => {
        if (d.id === 'store') {
            const data = d.data();
            document.getElementById('set-name').value = data.name || '';
            document.getElementById('set-whatsapp').value = data.whatsapp || '';
            document.getElementById('set-tax').value = data.deliveryTax || 0;
        }
    });
}

window.saveSettings = async (e) => {
    e.preventDefault();
    const settings = {
        name: document.getElementById('set-name').value,
        whatsapp: document.getElementById('set-whatsapp').value,
        deliveryTax: parseFloat(document.getElementById('set-tax').value)
    };
    
    const logoFile = document.getElementById('set-logo').files[0];
    if (logoFile) settings.logo = await convertImageToBase64(logoFile);
    
    await setDoc(doc(db, "settings", "store"), settings, { merge: true });
    Swal.fire('Sucesso', 'Configurações salvas!', 'success');
};

// UTILS
window.deleteItem = async (col, id) => {
    const res = await Swal.fire({ title: 'Excluir?', showCancelButton: true, confirmButtonColor: '#f72585' });
    if (res.isConfirmed) {
        await deleteDoc(doc(db, col, id));
        Swal.fire('Excluído', '', 'success');
    }
};

function convertImageToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// Exportar funções para o HTML
window.handleLogin = async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value);
    } catch (e) { Swal.fire('Erro', 'Credenciais inválidas', 'error'); }
};
window.handleLogout = () => signOut(auth);
window.saveProduct = async (e) => {
    e.preventDefault();
    const catSelect = document.getElementById('p-category');
    const pData = {
        name: document.getElementById('p-name').value,
        price: parseFloat(document.getElementById('p-price').value),
        description: document.getElementById('p-desc').value,
        categoryId: catSelect.value,
        categoryName: catSelect.options[catSelect.selectedIndex].text,
        active: true,
        image: await convertImageToBase64(document.getElementById('p-image').files[0])
    };
    await addDoc(collection(db, "products"), pData);
    e.target.reset();
    Swal.fire('Sucesso', 'Produto adicionado', 'success');
};
