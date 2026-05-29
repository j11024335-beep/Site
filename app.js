import { db, collection, getDocs, onSnapshot, query, where, orderBy } from './firebase.js';

// Estado da Aplicação
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let storeConfig = {};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadStoreConfig();
    loadCategories();
    loadProducts();
    updateCartBadge();
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }
});

// Carregar Configurações da Loja
async function loadStoreConfig() {
    onSnapshot(doc(db, "settings", "store"), (doc) => {
        if (doc.exists()) {
            storeConfig = doc.data();
            renderStoreHeader();
        }
    });
}

function renderStoreHeader() {
    const banner = document.getElementById('banner');
    const logo = document.getElementById('store-logo');
    const name = document.getElementById('store-name');
    
    if (storeConfig.banner) banner.style.backgroundImage = `url(${storeConfig.banner})`;
    if (storeConfig.logo) logo.src = storeConfig.logo;
    if (storeConfig.name) name.innerText = storeConfig.name;
    
    document.title = storeConfig.name || "Cardápio Digital";
}

// Carregar Categorias
async function loadCategories() {
    const q = query(collection(db, "categories"), orderBy("name"));
    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('categories-list');
        container.innerHTML = '<div class="category-item active" onclick="filterByCategory(\'all\')">Todos</div>';
        
        snapshot.forEach(doc => {
            const cat = doc.data();
            container.innerHTML += `
                <div class="category-item" onclick="filterByCategory('${doc.id}')">
                    ${cat.name}
                </div>
            `;
        });
    });
}

// Carregar Produtos
async function loadProducts() {
    const q = query(collection(db, "products"), where("active", "==", true));
    onSnapshot(q, (snapshot) => {
        products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        renderProducts(products);
    });
}

function renderProducts(items) {
    const container = document.getElementById('products-grid');
    container.innerHTML = '';
    
    items.forEach(item => {
        container.innerHTML += `
            <div class="product-card" onclick="openProductModal('${item.id}')">
                <img src="${item.image || 'https://via.placeholder.com/300'}" class="product-img">
                <div class="product-content">
                    <h3>${item.name}</h3>
                    <p class="text-muted">${item.description || ''}</p>
                    <div class="mt-2">
                        ${item.promoPrice ? `<span class="old-price">R$ ${item.price}</span>` : ''}
                        <span class="product-price">R$ ${item.promoPrice || item.price}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Carrinho
window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.promoPrice || product.price,
            quantity: 1
        });
    }
    
    saveCart();
    Swal.fire({
        icon: 'success',
        title: 'Adicionado!',
        text: `${product.name} foi para o carrinho`,
        showConfirmButton: false,
        timer: 1500
    });
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;
}

// Enviar para WhatsApp
window.checkout = () => {
    if (cart.length === 0) return;
    
    let message = `*Novo Pedido - ${storeConfig.name}*\n\n`;
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        message += `${item.quantity}x ${item.name} - R$ ${subtotal.toFixed(2)}\n`;
        total += subtotal;
    });
    
    message += `\n*Total: R$ ${total.toFixed(2)}*`;
    
    const phone = storeConfig.whatsapp || "5500000000000";
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    cart = [];
    saveCart();
};

// Funções globais para o HTML
window.filterByCategory = (catId) => {
    if (catId === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.categoryId === catId);
        renderProducts(filtered);
    }
};
