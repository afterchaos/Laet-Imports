// ========================================
// LAET IMPORTS - Admin Panel JavaScript
// ========================================

// Initial Data
const initialProducts = [
    {
        id: 1,
        name: "Vape Pod System Pro 5000 Puffs",
        category: "vapes",
        categoryLabel: "Vapes",
        price: 89.90,
        oldPrice: 129.90,
        installment: "3x de R$ 29,97 sem juros",
        badge: "sale",
        badgeText: "-31%",
        icon: "laptop",
        imageUrl: ""
    },
    {
        id: 2,
        name: "Carregador Portatil 10000mAh",
        category: "gadgets",
        categoryLabel: "Gadgets",
        price: 79.90,
        oldPrice: null,
        installment: "2x de R$ 39,95 sem juros",
        badge: "new",
        badgeText: "Novo",
        icon: "storage",
        imageUrl: ""
    },
    {
        id: 3,
        name: "Fone Bluetooth TWS Premium",
        category: "fones",
        categoryLabel: "Fones",
        price: 149.90,
        oldPrice: 199.90,
        installment: "3x de R$ 49,97 sem juros",
        badge: "sale",
        badgeText: "-25%",
        icon: "headset",
        imageUrl: ""
    },
    {
        id: 4,
        name: "Coil de Reposicao (Pack 5un)",
        category: "acessorios",
        categoryLabel: "Acessorios",
        price: 39.90,
        oldPrice: null,
        installment: "",
        badge: null,
        icon: "gpu",
        imageUrl: ""
    },
    {
        id: 5,
        name: "Vape Pen Starter Kit",
        category: "vapes",
        categoryLabel: "Vapes",
        price: 159.90,
        oldPrice: 199.90,
        installment: "4x de R$ 39,98 sem juros",
        badge: "sale",
        badgeText: "-20%",
        icon: "laptop",
        imageUrl: ""
    },
    {
        id: 6,
        name: "Smartwatch Fitness Pro",
        category: "gadgets",
        categoryLabel: "Gadgets",
        price: 199.90,
        oldPrice: null,
        installment: "4x de R$ 49,98 sem juros",
        badge: "new",
        badgeText: "Novo",
        icon: "monitor",
        imageUrl: ""
    }
];

const initialCategories = [
    { id: 'todos', label: 'Todos', protected: true },
    { id: 'vapes', label: 'Vapes' },
    { id: 'acessorios', label: 'Acessorios' },
    { id: 'gadgets', label: 'Gadgets' },
    { id: 'fones', label: 'Fones' }
];

const initialUsers = [
    { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Administrador' },
    { id: 2, username: 'editor', password: '123', role: 'editor', name: 'Editor de Produtos' }
];

// State (API)
let products = [];
let categories = [];
let users = [];
let siteContent = {};
let currentUser = null;

// Site content configuration - fallback
const initialSiteContent = {

    heroBadge: 'Vape & Tech',
    heroTitle: 'Os melhores vapes<br>e eletrônicos em um só lugar',
    heroDescription: 'Encontre dispositivos vape premium, acessórios e gadgets com entrega rápida e garantia confiável.',
    heroBtn1: 'Ver Novidades',
    heroBtn2: 'Promoções',
    feature1Title: 'Produtos Originais',
    feature1Desc: '100% importados com nota fiscal',
    feature2Title: 'Garantia Estendida',
    feature2Desc: 'Até 2 anos de garantia',
    feature3Title: 'Entrega Rápida',
    feature3Desc: 'Para todo o Brasil',
    feature4Title: 'Parcelamento',
    feature4Desc: 'Em até 12x sem juros',
    productsSectionTitle: 'Vapes e Eletrônicos',
    productsSectionDesc: 'Seleção premium de dispositivos, acessórios e gadgets para quem busca qualidade.',
    offerBadge: 'Oferta Especial',
    offerTitle: 'Até 40% OFF',
    offerDescription: 'Em vapes, pods e acessórios eletrônicos. Estoque limitado — garanta o seu.',
    offerBtn: 'Aproveitar',
    newsletterTitle: 'Receba ofertas exclusivas',
    newsletterDesc: 'Fique por dentro de lançamentos em vape e eletrônicos com descontos especiais.',
    footerDescription: 'Sua loja de confiança para produtos de tecnologia importados.',
    footerCopyright: '&copy; 2026 LAET IMPORTS. Todos os direitos reservados.'
};





// DOM Elements
const adminLoginSection = document.getElementById('admin-login-section');
const adminDashboardSection = document.getElementById('admin-dashboard-section');
const adminLoginForm = document.getElementById('admin-login-form');
const adminNav = document.getElementById('admin-nav');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Stats
const statProducts = document.getElementById('stat-products');
const statCategories = document.getElementById('stat-categories');
const statUsers = document.getElementById('stat-users');

// Admin elements
const adminProductsList = document.getElementById('admin-products-list');
const adminCategoriesList = document.getElementById('admin-categories-list');
const adminUsersList = document.getElementById('admin-users-list');
const addProductBtn = document.getElementById('add-product-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const addUserBtn = document.getElementById('add-user-btn');
const productEditorModal = document.getElementById('product-editor-modal');
const closeProductEditor = document.getElementById('close-product-editor');
const productForm = document.getElementById('product-form');
const categoryEditorModal = document.getElementById('category-editor-modal');
const closeCategoryEditor = document.getElementById('close-category-editor');
const categoryForm = document.getElementById('category-form');
const userEditorModal = document.getElementById('user-editor-modal');
const closeUserEditor = document.getElementById('close-user-editor');
const userForm = document.getElementById('user-form');
const adminTabs = document.querySelectorAll('.admin-tab');
const adminTabContents = document.querySelectorAll('.admin-tab-content');
const tabUsersBtn = document.getElementById('tab-users-btn');
const prodImagesInput = document.getElementById('prod-images');
const prodImagePreview = document.getElementById('prod-image-preview');

// Utility functions
async function saveProducts() {
    // not used anymore
}

async function saveCategories() {
    // not used anymore
}

async function saveUsers() {
    // not used anymore
}

async function saveSiteContent() {
    // not used anymore
}

async function loadAdminData() {
    // Capturar exatamente qual endpoint falha ajuda a corrigir token/headers/mode.
    let catsRes, prodsRes, usersRes, contentRes = null;

    try {
        catsRes = await apiAdminGet('/api/admin/categories');
    } catch (e) {
        e.endpoint = '/api/admin/categories';
        throw e;
    }

    try {
        prodsRes = await apiAdminGet('/api/admin/products');
    } catch (e) {
        e.endpoint = '/api/admin/products';
        throw e;
    }

    try {
        usersRes = await apiAdminGet('/api/admin/users');
    } catch (e) {
        e.endpoint = '/api/admin/users';
        throw e;
    }

    try {
        contentRes = await apiAdminGet('/api/admin/site-content');
    } catch (_) {
        contentRes = null;
    }

    categories = (catsRes && catsRes.categories) ? catsRes.categories : [];
    products = (prodsRes && prodsRes.products) ? prodsRes.products : [];
    users = (usersRes && usersRes.users) ? usersRes.users : [];
    siteContent = (contentRes && contentRes.siteContent) ? contentRes.siteContent : initialSiteContent;
}


function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function readImageFiles(files) {
    return Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    })));
}

function updateProductPreview(urls = []) {
    if (!prodImagePreview) return;
    prodImagePreview.innerHTML = urls.map(url => `<img src="${url}" alt="Preview da imagem">`).join('');
}

if (prodImagesInput) {
    prodImagesInput.addEventListener('change', () => {
        const files = prodImagesInput.files;
        if (!files || files.length === 0) {
            updateProductPreview([]);
            return;
        }
        const previewUrls = Array.from(files).map(file => URL.createObjectURL(file));
        updateProductPreview(previewUrls);
    });
}

// Login (API)
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('admin-username').value;
    const passwordInput = document.getElementById('admin-password').value;


    try {
        const res = await apiPost('/api/admin/login', { username: usernameInput, password: passwordInput });
        if (!res || !res.user) throw new Error('Login failed');

        currentUser = res.user;
        localStorage.setItem('laet-admin-token', res.token || 'admin-token');
        localStorage.setItem('laet-admin-role', res.user.role || 'editor');

        try {
            localStorage.setItem('laet-admin-token', res.token || 'admin-token');
            localStorage.setItem('laet-admin-role', res.user.role || 'editor');
            currentUser = res.user;
            await showDashboard();
            showToast(`Bem-vindo, ${res.user.name}!`);
            adminLoginForm.reset();
        } catch (uiErr) {
            console.error(uiErr);
            alert('Erro ao carregar o painel: ' + (uiErr && uiErr.message ? uiErr.message : String(uiErr)));
        }
    } catch (err) {
        console.error(err);
        const msg = err && err.message ? err.message : String(err);
        alert('Usuario ou senha incorretos! Detalhes: ' + msg);
    }
});



async function showDashboard() {
    adminLoginSection.classList.add('hidden');
    adminDashboardSection.classList.remove('hidden');


    // Update nav
    adminNav.innerHTML = `
        <div class="admin-user-info">
            <div class="admin-user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <span class="admin-user-name">${currentUser.name}</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="logout-btn" style="margin-left: 16px;">Sair</button>
        <a href="index.html" class="back-to-site" style="margin-left: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Site
        </a>
    `;

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Role-based visibility
    if (currentUser.role === 'admin') {
        tabUsersBtn.style.display = 'block';
    } else {
        tabUsersBtn.style.display = 'none';
    }

    try {
        await loadAdminData();
        updateStats();
        renderAdminProducts();
        renderAdminCategories();
        renderAdminUsers();
        loadContentToForm();
    } catch (e) {
        // volta para o login e mostra erro real
        adminDashboardSection.classList.add('hidden');
        adminLoginSection.classList.remove('hidden');
        console.error(e);
        throw e;
    }
}

function logout() {
    currentUser = null;
    adminDashboardSection.classList.add('hidden');
    adminLoginSection.classList.remove('hidden');
    adminNav.innerHTML = `
        <a href="index.html" class="back-to-site">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar ao Site
        </a>
    `;
    showToast('Sessao encerrada.');
}

function updateStats() {
    statProducts.textContent = products.length;
    statCategories.textContent = categories.filter(c => c.id !== 'todos').length;
    statUsers.textContent = users.length;
}


// Tabs
adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        adminTabs.forEach(t => t.classList.remove('active'));
        adminTabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const content = document.getElementById(tab.dataset.tab);
        if (content) content.classList.add('active');
    });
});

// Render Admin Products
function renderAdminProducts() {
    adminProductsList.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.categoryLabel || ''}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>
                <div class="admin-table-actions">
                    <button class="btn-icon" onclick="editProduct(${product.id})" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteProduct(${product.id})" title="Excluir">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}


// Render Admin Categories
function renderAdminCategories() {
    adminCategoriesList.innerHTML = categories.filter(c => c.id !== 'todos').map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.label}</td>
            <td>
                <div class="admin-table-actions">
                    <button class="btn-icon" onclick="editCategory('${category.id}')" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteCategory('${category.id}')" title="Excluir" ${category.protected ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Update product category select
    const prodCategorySelect = document.getElementById('prod-category');
    if (prodCategorySelect) {
        prodCategorySelect.innerHTML = categories.filter(c => c.id !== 'todos').map(c => `
            <option value="${c.id}">${c.label}</option>
        `).join('');
    }
}

// Render Admin Users
function renderAdminUsers() {
    if (!adminUsersList) return;
    adminUsersList.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td><span class="badge ${user.role}">${user.role.toUpperCase()}</span></td>
            <td>
                <div class="admin-table-actions">
                    <button class="btn-icon" onclick="editUser(${user.id})" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteUser(${user.id})" title="Excluir" ${user.id === 1 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Product CRUD
addProductBtn.addEventListener('click', () => {
    document.getElementById('product-editor-title').textContent = 'Novo Produto';
    productForm.reset();
    if (prodImagesInput) prodImagesInput.value = '';
    document.getElementById('prod-description').value = '';
    updateProductPreview([]);
    document.getElementById('edit-product-id').value = '';
    productEditorModal.classList.add('active');
});

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('product-editor-title').textContent = 'Editar Produto';
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('prod-name').value = product.name;
    document.getElementById('prod-category').value = product.category;
    document.getElementById('prod-icon').value = product.icon;
    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-old-price').value = product.oldPrice || '';
    document.getElementById('prod-image').value = product.imageUrl || '';
    document.getElementById('prod-description').value = product.description || '';
    document.getElementById('prod-badge').value = product.badge || '';
    document.getElementById('prod-badge-text').value = product.badgeText || '';
    if (prodImagesInput) prodImagesInput.value = '';
    const previewUrls = product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []);
    updateProductPreview(previewUrls);
    
    productEditorModal.classList.add('active');
};

window.deleteProduct = function(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderAdminProducts();
        updateStats();
        showToast('Produto excluido!');
    }
};

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-product-id').value;
    const categoryId = document.getElementById('prod-category').value;
    const categoryLabel = categories.find(c => c.id === categoryId)?.label || 'Outros';
    const price = parseFloat(document.getElementById('prod-price').value);
    const imageUrlField = document.getElementById('prod-image').value.trim();
    const files = prodImagesInput ? prodImagesInput.files : null;

    try {
        // Save product fields first
        const payload = {
            id: id ? parseInt(id, 10) : Date.now(),
            name: document.getElementById('prod-name').value,
            category: categoryId,
            categoryLabel,
            icon: document.getElementById('prod-icon').value,
            price,
            oldPrice: document.getElementById('prod-old-price').value ? parseFloat(document.getElementById('prod-old-price').value) : null,
            description: document.getElementById('prod-description').value.trim(),
            badge: document.getElementById('prod-badge').value,
            badgeText: document.getElementById('prod-badge-text').value,
            installment: price > 100 ? `${Math.min(12, Math.floor(price / 50))}x de ${formatCurrency(price / Math.min(12, Math.floor(price / 50)))} sem juros` : '',
        };

        if (id) {
            await apiAdminPut(`/api/admin/products/${id}`, payload);
        } else {
            const createRes = await apiAdminPost('/api/admin/products', payload);
            // backend returns id, but payload already has it
        }

        // Save images (files) if present
        if (files && files.length > 0) {
            const productIdToUpload = id ? parseInt(id, 10) : payload.id;
            await apiAdminUploadImages(productIdToUpload, files);
        } else if (imageUrlField) {
            // If only URL was provided, we still allow it by uploading a single image URL as product description.
            // Current backend supports only filesystem upload for images; URL mode will be treated as no file.
            // Keep product.imageUrl empty to avoid broken UI.
        }

        await loadAdminData();
        renderAdminProducts();
        updateStats();

        if (prodImagesInput) prodImagesInput.value = '';
        updateProductPreview([]);
        productEditorModal.classList.remove('active');
        showToast('Produto salvo com sucesso!');
    } catch (err) {
        alert('Erro ao salvar produto');
        console.error(err);
    }
});


closeProductEditor.addEventListener('click', () => {
    productEditorModal.classList.remove('active');
});

// Category CRUD
addCategoryBtn.addEventListener('click', () => {
    document.getElementById('category-editor-title').textContent = 'Nova Categoria';
    categoryForm.reset();
    document.getElementById('edit-category-id').value = '';
    document.getElementById('cat-id').disabled = false;
    categoryEditorModal.classList.add('active');
});


window.editCategory = function(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('category-editor-title').textContent = 'Editar Categoria';
    document.getElementById('edit-category-id').value = category.id;
    document.getElementById('cat-id').value = category.id;
    document.getElementById('cat-id').disabled = true;
    document.getElementById('cat-label').value = category.label;
    
    categoryEditorModal.classList.add('active');
};

window.deleteCategory = async function(id) {
    const category = categories.find(c => c.id === id);
    if (category && category.protected) {
        alert('Esta categoria e protegida e nao pode ser excluida!');
        return;
    }
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
        await apiAdminDel(`/api/admin/categories/${id}`);
        await loadAdminData();
        renderAdminCategories();
        updateStats();
        showToast('Categoria excluida!');
    } catch {
        alert('Erro ao excluir categoria');
    }
};


categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('edit-category-id').value;
    const catId = document.getElementById('cat-id').value;
    const catLabel = document.getElementById('cat-label').value;

    try {
        if (editId) {
            await apiAdminPut(`/api/admin/categories/${editId}`, { label: catLabel });
        } else {
            await apiAdminPost('/api/admin/categories', { id: catId, label: catLabel, protected: false });
        }

        await loadAdminData();
        renderAdminCategories();
        updateStats();
        categoryEditorModal.classList.remove('active');
        showToast('Categoria salva com sucesso!');
    } catch (err) {
        alert('Erro ao salvar categoria');
    }
});


closeCategoryEditor.addEventListener('click', () => {
    categoryEditorModal.classList.remove('active');
});

// User CRUD
addUserBtn.addEventListener('click', () => {
    if (currentUser.role !== 'admin') return alert('Apenas administradores podem gerenciar usuarios.');
    document.getElementById('user-editor-title').textContent = 'Novo Usuario';
    userForm.reset();
    document.getElementById('edit-user-id').value = '';
    userEditorModal.classList.add('active');
});

window.editUser = function(id) {
    if (currentUser.role !== 'admin') return alert('Apenas administradores podem gerenciar usuarios.');
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('user-editor-title').textContent = 'Editar Usuario';
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('user-fullname').value = user.name;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-password').value = user.password;
    document.getElementById('user-role').value = user.role;
    
    userEditorModal.classList.add('active');
};

window.deleteUser = function(id) {
    if (currentUser.role !== 'admin') return alert('Apenas administradores podem gerenciar usuarios.');
    if (id === 1) return alert('O administrador principal nao pode ser excluido.');
    
    if (confirm('Tem certeza que deseja excluir este usuario?')) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        renderAdminUsers();
        updateStats();
        showToast('Usuario excluido!');
    }
};

userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-user-id').value;
    const username = document.getElementById('user-username').value;
    
    const existing = users.find(u => u.username === username && u.id !== parseInt(id));
    if (existing) return alert('Este nome de usuario ja esta em uso!');

    const userData = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('user-fullname').value,
        username: username,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value
    };

    if (id) {
        const index = users.findIndex(u => u.id === parseInt(id));
        users[index] = userData;
    } else {
        users.push(userData);
    }

    saveUsers();
    renderAdminUsers();
    updateStats();
    userEditorModal.classList.remove('active');
    showToast('Usuario salvo com sucesso!');
});

closeUserEditor.addEventListener('click', () => {
    userEditorModal.classList.remove('active');
});

// Content Management Functions
function loadContentToForm() {
    if (!siteContent) return;
    // Hero Section
    document.getElementById('edit-hero-badge').value = siteContent.heroBadge || '';
    document.getElementById('edit-hero-title').value = siteContent.heroTitle || '';
    document.getElementById('edit-hero-description').value = siteContent.heroDescription || '';

    document.getElementById('edit-hero-btn-1').value = siteContent.heroBtn1 || '';
    document.getElementById('edit-hero-btn-2').value = siteContent.heroBtn2 || '';
    
    // Features
    document.getElementById('edit-feature-1-title').value = siteContent.feature1Title || '';
    document.getElementById('edit-feature-1-desc').value = siteContent.feature1Desc || '';
    document.getElementById('edit-feature-2-title').value = siteContent.feature2Title || '';
    document.getElementById('edit-feature-2-desc').value = siteContent.feature2Desc || '';
    document.getElementById('edit-feature-3-title').value = siteContent.feature3Title || '';
    document.getElementById('edit-feature-3-desc').value = siteContent.feature3Desc || '';
    document.getElementById('edit-feature-4-title').value = siteContent.feature4Title || '';
    document.getElementById('edit-feature-4-desc').value = siteContent.feature4Desc || '';
    
    // Products Section
    document.getElementById('edit-products-title').value = siteContent.productsSectionTitle || '';
    document.getElementById('edit-products-desc').value = siteContent.productsSectionDesc || '';
    
    // Offers Section
    document.getElementById('edit-offer-badge').value = siteContent.offerBadge || '';
    document.getElementById('edit-offer-title').value = siteContent.offerTitle || '';
    document.getElementById('edit-offer-description').value = siteContent.offerDescription || '';
    document.getElementById('edit-offer-btn').value = siteContent.offerBtn || '';
    
    // Newsletter
    document.getElementById('edit-newsletter-title').value = siteContent.newsletterTitle || '';
    document.getElementById('edit-newsletter-desc').value = siteContent.newsletterDesc || '';
    
    // Footer
    document.getElementById('edit-footer-description').value = siteContent.footerDescription || '';
    document.getElementById('edit-footer-copyright').value = siteContent.footerCopyright || '';

    // Contato
    const contact = JSON.parse(localStorage.getItem('laet-contact')) || { whatsapp: '', instagram: '' };
    document.getElementById('edit-whatsapp').value = contact.whatsapp || '';
    document.getElementById('edit-instagram').value = contact.instagram || '';
}

async function saveContentFromForm() {
    try {
        const payload = {
            heroBadge: document.getElementById('edit-hero-badge').value,
            heroTitle: document.getElementById('edit-hero-title').value,
            heroDescription: document.getElementById('edit-hero-description').value,
            heroBtn1: document.getElementById('edit-hero-btn-1').value,
            heroBtn2: document.getElementById('edit-hero-btn-2').value,

            feature1Title: document.getElementById('edit-feature-1-title').value,
            feature1Desc: document.getElementById('edit-feature-1-desc').value,
            feature2Title: document.getElementById('edit-feature-2-title').value,
            feature2Desc: document.getElementById('edit-feature-2-desc').value,
            feature3Title: document.getElementById('edit-feature-3-title').value,
            feature3Desc: document.getElementById('edit-feature-3-desc').value,
            feature4Title: document.getElementById('edit-feature-4-title').value,
            feature4Desc: document.getElementById('edit-feature-4-desc').value,

            productsSectionTitle: document.getElementById('edit-products-title').value,
            productsSectionDesc: document.getElementById('edit-products-desc').value,

            offerBadge: document.getElementById('edit-offer-badge').value,
            offerTitle: document.getElementById('edit-offer-title').value,
            offerDescription: document.getElementById('edit-offer-description').value,
            offerBtn: document.getElementById('edit-offer-btn').value,

            newsletterTitle: document.getElementById('edit-newsletter-title').value,
            newsletterDesc: document.getElementById('edit-newsletter-desc').value,

            footerDescription: document.getElementById('edit-footer-description').value,
            footerCopyright: document.getElementById('edit-footer-copyright').value,
        };

        await apiAdminPut('/api/admin/site-content', payload);

        const contactPayload = {
            whatsapp: document.getElementById('edit-whatsapp').value.trim(),
            instagram: document.getElementById('edit-instagram').value.trim(),
        };
        await apiAdminPut('/api/admin/contact', contactPayload);

        await loadAdminData();
        loadContentToForm();
        showToast('Conteúdo do site salvo com sucesso!');
    } catch (err) {
        alert('Erro ao salvar conteúdo do site');
        console.error(err);
    }
}


async function resetContentToDefault() {
    if (!confirm('Tem certeza que deseja restaurar todo o conteúdo para o padrão?')) return;
    try {
        // Re-apply from default fallback
        await apiAdminPut('/api/admin/site-content', initialSiteContent);
        await apiAdminPut('/api/admin/contact', { whatsapp: '', instagram: '' });
        await loadAdminData();
        loadContentToForm();
        showToast('Conteúdo restaurado para o padrão!');
    } catch (e) {
        alert('Erro ao restaurar conteúdo');
    }
}


// Content editing event listeners
const saveContentBtn = document.getElementById('save-content-btn');
const resetContentBtn = document.getElementById('reset-content-btn');

if (saveContentBtn) {
    saveContentBtn.addEventListener('click', saveContentFromForm);
}

if (resetContentBtn) {
    resetContentBtn.addEventListener('click', resetContentToDefault);
}


// Global close for all modals
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Tabs UI is built on login, so we only set initial categories list as fallback
    // real data is loaded after API login
    renderAdminCategories();
});

