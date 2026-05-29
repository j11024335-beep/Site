import { db, auth, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase.js';

// Verificação de Autenticação
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    
    if (user) {
        if (loginSection) loginSection.style.display = 'none';
        if (adminSection) adminSection.style.display = 'block';
        initAdmin();
    } else {
        if (loginSection) loginSection.style.display = 'flex';
        if (adminSection) adminSection.style.display = 'none';
    }
});

// Login
window.handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        Swal.fire('Erro', 'Login inválido', 'error');
    }
};

window.handleLogout = () => signOut(auth);

// Inicializar Admin
function initAdmin() {
    loadDashboardStats();
    loadAdminProducts();
    loadAdminCategories();
}

// Stats
async function loadDashboardStats() {
    const productsSnap = await getDocs(collection(db, "products"));
    const ordersSnap = await getDocs(collection(db, "orders"));
    
    document.getElementById('total-products').innerText = productsSnap.size;
    document.getElementById('total-orders').innerText = ordersSnap.size;
}

// Gestão de Produtos
window.saveProduct = async (e) => {
    e.preventDefault();
    const productData = {
        name: document.getElementById('p-name').value,
        description: document.getElementById('p-desc').value,
        price: parseFloat(document.getElementById('p-price').value),
        categoryId: document.getElementById('p-category').value,
        active: true,
        image: await convertImageToBase64(document.getElementById('p-image').files[0])
    };

    try {
        await addDoc(collection(db, "products"), productData);
        Swal.fire('Sucesso', 'Produto cadastrado!', 'success');
        e.target.reset();
    } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar', 'error');
    }
};

// Conversão Base64 (Conforme solicitado)
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Carregar Produtos na Tabela
function loadAdminProducts() {
    onSnapshot(collection(db, "products"), (snapshot) => {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const p = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td><img src="${p.image}" width="40"></td>
                    <td>${p.name}</td>
                    <td>R$ ${p.price}</td>
                    <td>
                        <button onclick="deleteProduct('${doc.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    });
}

window.deleteProduct = async (id) => {
    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter isso!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!'
    });

    if (result.isConfirmed) {
        await deleteDoc(doc(db, "products", id));
        Swal.fire('Excluído!', 'O produto foi removido.', 'success');
    }
};
