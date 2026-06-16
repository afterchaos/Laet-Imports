// ========================================
// LAET IMPORTS - Main Store JavaScript
// ========================================

// Initial Data
const initialProducts = [
    { id: 1, name: "Vape Pod System Pro 5000 Puffs", category: "vapes", categoryLabel: "Vapes", price: 89.90, oldPrice: 129.90, installment: "3x de R$ 29,97 sem juros", badge: "sale", badgeText: "-31%", icon: "laptop", imageUrl: "" },
    { id: 2, name: "Carregador Portatil 10000mAh", category: "gadgets", categoryLabel: "Gadgets", price: 79.90, oldPrice: null, installment: "2x de R$ 39,95 sem juros", badge: "new", badgeText: "Novo", icon: "storage", imageUrl: "" },
    { id: 3, name: "Fone Bluetooth TWS Premium", category: "fones", categoryLabel: "Fones", price: 149.90, oldPrice: 199.90, installment: "3x de R$ 49,97 sem juros", badge: "sale", badgeText: "-25%", icon: "headset", imageUrl: "" },
    { id: 4, name: "Coil de Reposicao (Pack 5un)", category: "acessorios", categoryLabel: "Acessorios", price: 39.90, oldPrice: null, installment: "", badge: null, icon: "gpu", imageUrl: "" },
    { id: 5, name: "Vape Pen Starter Kit", category: "vapes", categoryLabel: "Vapes", price: 159.90, oldPrice: 199.90, installment: "4x de R$ 39,98 sem juros", badge: "sale", badgeText: "-20%", icon: "laptop", imageUrl: "" },
    { id: 6, name: "Smartwatch Fitness Pro", category: "gadgets", categoryLabel: "Gadgets", price: 199.90, oldPrice: null, installment: "4x de R$ 49,98 sem juros", badge: "new", badgeText: "Novo", icon: "monitor", imageUrl: "" },
    { id: 7, name: "Fone Over-Ear Gamer RGB", category: "fones", categoryLabel: "Fones", price: 189.90, oldPrice: 249.90, installment: "4x de R$ 47,48 sem juros", badge: "sale", badgeText: "-24%", icon: "headset", imageUrl: "" },
    { id: 8, name: "Vape Box Mod 200W", category: "vapes", categoryLabel: "Vapes", price: 299.90, oldPrice: null, installment: "6x de R$ 49,98 sem juros", badge: null, icon: "laptop", imageUrl: "" },
    { id: 9, name: "Case de Transporte Premium", category: "acessorios", categoryLabel: "Acessorios", price: 49.90, oldPrice: 69.90, installment: "", badge: "sale", badgeText: "-29%", icon: "storage", imageUrl: "" },
    { id: 10, name: "Caixa de Som Bluetooth", category: "gadgets", categoryLabel: "Gadgets", price: 129.90, oldPrice: null, installment: "3x de R$ 43,30 sem juros", badge: "new", badgeText: "Novo", icon: "monitor", imageUrl: "" },
    { id: 11, name: "Essence Menta 30ml", category: "acessorios", categoryLabel: "Acessorios", price: 29.90, oldPrice: null, installment: "", badge: null, icon: "webcam", imageUrl: "" },
    { id: 12, name: "Fone Esportivo Bluetooth", category: "fones", categoryLabel: "Fones", price: 99.90, oldPrice: null, installment: "2x de R$ 49,95 sem juros", badge: null, icon: "headset", imageUrl: "" }
];

const initialCategories = [
    { id: 'todos', label: 'Todos', protected: true },
    { id: 'vapes', label: 'Vapes' },
    { id: 'acessorios', label: 'Acessórios' },
    { id: 'gadgets', label: 'Gadgets' },
    { id: 'fones', label: 'Fones' }
];

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

// State
let products = [];
let categories = [];
let siteContent = {};
let contact = { whatsapp: '', instagram: '' };
let activeCategory = 'todos';

async function loadShopData() {
    try {
        const [catsRes, contentRes, contactRes, productsRes] = await Promise.all([
            apiGet('/api/categories'),
            apiGet('/api/site-content'),
            apiGet('/api/contact'),
            apiGet('/api/products'),
        ]);

        categories = catsRes.categories || [];
        siteContent = contentRes.siteContent || initialSiteContent;
        contact = contactRes.contact || { whatsapp: '', instagram: '' };
        products = productsRes.products || initialProducts;

        // if no categories, fallback
        if (!categories.length) categories = initialCategories;
    } catch (e) {
        // Fallback para não quebrar a UI
        products = JSON.parse(localStorage.getItem('laet-products')) || initialProducts;
        categories = JSON.parse(localStorage.getItem('laet-categories')) || initialCategories;
        siteContent = JSON.parse(localStorage.getItem('laet-site-content')) || initialSiteContent;
        contact = JSON.parse(localStorage.getItem('laet-contact')) || { whatsapp: '', instagram: '' };
    }
}


// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoryMenu = document.getElementById('category-menu');
const categoryToggle = document.getElementById('category-toggle');
const selectedCategoryLabel = document.getElementById('selected-category-label');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const menuToggle = document.getElementById('menu-toggle');
const navMobile = document.getElementById('nav-mobile');
const searchInput = document.getElementById('search-input');
const newsletterForm = document.getElementById('newsletter-form');
const navLinks = document.querySelectorAll('.nav-link');

// Icon SVGs
const icons = {
    laptop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
        <path d="M2 17h20l-2 4H4l-2-4z"></path>
    </svg>`,
    monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>`,
    keyboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
        <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M6 16h12"></path>
    </svg>`,
    mouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="6" y="3" width="12" height="18" rx="6"></rect>
        <line x1="12" y1="7" x2="12" y2="11"></line>
    </svg>`,
    gpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        <circle cx="7" cy="12" r="2"></circle>
        <circle cx="17" cy="12" r="2"></circle>
        <path d="M12 6V4M8 6V4M16 6V4M12 18v2M8 18v2M16 18v2"></path>
    </svg>`,
    storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="M6 8h4M6 12h4M6 16h4"></path>
        <circle cx="16" cy="12" r="2"></circle>
    </svg>`,
    headset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>`,
    memory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="6" width="20" height="12" rx="1"></rect>
        <path d="M6 6V4M10 6V4M14 6V4M18 6V4M6 18v2M10 18v2M14 18v2M18 18v2"></path>
    </svg>`,
    webcam: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="10" r="8"></circle>
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M12 18v4M8 22h8"></path>
    </svg>`
};

// Format currency
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Open WhatsApp with product info
function openWhatsApp(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const rawNumber = contact.whatsapp ? contact.whatsapp.replace(/\D/g, '') : '';
    if (!rawNumber) {
        showToast('WhatsApp não configurado. Entre em contato pelo Instagram!');
        return;
    }
    const msg = `Olá! Tenho interesse no produto: *${product.name}* — ${formatCurrency(product.price)}`;
    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Render products
function renderProducts(productsToRender) {
    productsGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">Nenhum produto encontrado.</p>';
        return;
    }

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                ${product.imageUrl || (product.imageUrls && product.imageUrls.length) ? 
                    `<img src="${product.imageUrl || product.imageUrls[0]}" alt="${product.name}" class="product-image-preview">` : 
                    `<div class="product-image-icon">${icons[product.icon] || icons.laptop}</div>`
                }
                ${product.badge ? `<span class="product-badge ${product.badge}">${product.badgeText}</span>` : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.categoryLabel}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price-wrapper">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    ${product.oldPrice ? `<span class="product-price-old">${formatCurrency(product.oldPrice)}</span>` : ''}
                </div>
                <p class="product-installment">${product.installment || ''}</p>
                <button class="add-to-cart" data-id="${product.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Ver produto
                </button>
            </div>
        `;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
window.open(`/product?id=${product.id}`, '_blank');
        });
        productsGrid.appendChild(card);
    });
}

// Show toast
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function getProductsForCurrentView() {
    let filtered = products;
    if (activeCategory !== 'todos') {
        filtered = filtered.filter(product => product.category === activeCategory);
    }
    return filtered;
}

function updateCategoryToggleLabel() {
    if (!selectedCategoryLabel) return;
    const current = categories.find(item => item.id === activeCategory) || categories[0];
    selectedCategoryLabel.textContent = current ? current.label : 'Todas as categorias';
}

function closeCategoryMenu() {
    if (!categoryMenu || !categoryToggle) return;
    categoryMenu.classList.remove('is-open');
    categoryMenu.hidden = true;
    categoryToggle.setAttribute('aria-expanded', 'false');
}

function openCategoryMenu() {
    if (!categoryMenu || !categoryToggle) return;
    categoryMenu.hidden = false;
    categoryMenu.classList.add('is-open');
    categoryToggle.setAttribute('aria-expanded', 'true');
}

function renderCategoryTabs() {
    if (!categoryMenu) return;
    categoryMenu.innerHTML = '';
    categories.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `category-option${item.id === activeCategory ? ' active' : ''}`;
        button.dataset.category = item.id;
        button.textContent = item.label;
        button.addEventListener('click', () => {
            filterProducts(item.id);
            closeCategoryMenu();
        });
        categoryMenu.appendChild(button);
    });
    updateCategoryToggleLabel();
}

function filterProducts(category) {
    activeCategory = category || 'todos';
    const allLinks = document.querySelectorAll('.nav-link');
    allLinks.forEach(link => {
        const isActive = link.dataset.category === activeCategory;
        link.classList.toggle('active', isActive);
    });
    renderCategoryTabs();
    renderProducts(getProductsForCurrentView());
}

function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();
    let filtered = getProductsForCurrentView();
    if (searchTerm !== '') {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.categoryLabel.toLowerCase().includes(searchTerm)
        );
    }
    renderProducts(filtered);
}

// Apply editable site content to HTML elements
function applySiteContent() {
    const heroBadge = document.getElementById('hero-badge');
    if (heroBadge) heroBadge.innerHTML = siteContent.heroBadge;

    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) heroTitle.innerHTML = siteContent.heroTitle;

    const heroDesc = document.getElementById('hero-description');
    if (heroDesc) heroDesc.textContent = siteContent.heroDescription;

    const heroBtn1 = document.getElementById('hero-btn-1');
    if (heroBtn1) heroBtn1.textContent = siteContent.heroBtn1;

    const heroBtn2 = document.getElementById('hero-btn-2');
    if (heroBtn2) heroBtn2.textContent = siteContent.heroBtn2;

    const feature1Title = document.getElementById('feature-1-title');
    if (feature1Title) feature1Title.textContent = siteContent.feature1Title;

    const feature1Desc = document.getElementById('feature-1-desc');
    if (feature1Desc) feature1Desc.textContent = siteContent.feature1Desc;

    const feature2Title = document.getElementById('feature-2-title');
    if (feature2Title) feature2Title.textContent = siteContent.feature2Title;

    const feature2Desc = document.getElementById('feature-2-desc');
    if (feature2Desc) feature2Desc.textContent = siteContent.feature2Desc;

    const feature3Title = document.getElementById('feature-3-title');
    if (feature3Title) feature3Title.textContent = siteContent.feature3Title;

    const feature3Desc = document.getElementById('feature-3-desc');
    if (feature3Desc) feature3Desc.textContent = siteContent.feature3Desc;

    const feature4Title = document.getElementById('feature-4-title');
    if (feature4Title) feature4Title.textContent = siteContent.feature4Title;

    const feature4Desc = document.getElementById('feature-4-desc');
    if (feature4Desc) feature4Desc.textContent = siteContent.feature4Desc;

    const productsTitle = document.getElementById('products-section-title');
    if (productsTitle) productsTitle.textContent = siteContent.productsSectionTitle;

    const productsDesc = document.getElementById('products-section-desc');
    if (productsDesc) productsDesc.textContent = siteContent.productsSectionDesc;

    const offerBadge = document.getElementById('offer-badge');
    if (offerBadge) offerBadge.textContent = siteContent.offerBadge;

    const offerTitle = document.getElementById('offer-title');
    if (offerTitle) offerTitle.textContent = siteContent.offerTitle;

    const offerDesc = document.getElementById('offer-description');
    if (offerDesc) offerDesc.textContent = siteContent.offerDescription;

    const offerBtn = document.getElementById('offer-btn');
    if (offerBtn) offerBtn.textContent = siteContent.offerBtn;

    const newsletterTitle = document.getElementById('newsletter-title');
    if (newsletterTitle) newsletterTitle.textContent = siteContent.newsletterTitle;

    const newsletterDesc = document.getElementById('newsletter-desc');
    if (newsletterDesc) newsletterDesc.textContent = siteContent.newsletterDesc;

    const footerDesc = document.getElementById('footer-description');
    if (footerDesc) footerDesc.textContent = siteContent.footerDescription;

    const footerCopyright = document.getElementById('footer-copyright');
    if (footerCopyright) footerCopyright.innerHTML = siteContent.footerCopyright;

    // Contact links
    const footerInstagram = document.getElementById('footer-instagram');
    if (footerInstagram && contact.instagram) {
        footerInstagram.href = contact.instagram;
    }

    const footerWhatsapp = document.getElementById('footer-whatsapp');
    if (footerWhatsapp && contact.whatsapp) {
        const rawNumber = contact.whatsapp.replace(/\D/g, '');
        footerWhatsapp.href = `https://wa.me/${rawNumber}`;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    await loadShopData();

    renderCategoryTabs();
    closeCategoryMenu();
    filterProducts('todos');

    applySiteContent();

    if (categoryToggle) {
        categoryToggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (categoryMenu.hidden) {
                openCategoryMenu();
            } else {
                closeCategoryMenu();
            }
        });
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.category-selector')) {
            closeCategoryMenu();
        }
    });
});

// Mobile menu
menuToggle.addEventListener('click', () => {
    navMobile.classList.toggle('active');
});

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;

        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');

        filterProducts(category);
        navMobile.classList.remove('active');
        document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
    });
});

// Search
searchInput.addEventListener('input', (e) => {
    searchProducts(e.target.value);
});

// Newsletter form
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    if (email) {
        showToast('E-mail cadastrado com sucesso!');
        e.target.reset();
    }
});

// ========================================
// HEADER SCROLL BEHAVIOR
// ========================================
let lastScrollY = window.scrollY;
let ticking = false;
const header = document.querySelector('.header');

function updateHeader() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.classList.add('header-hidden');
    } else {
        header.classList.remove('header-hidden');
    }
    lastScrollY = currentScrollY;
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            updateHeader();
        });
        ticking = true;
    }
});

// Global close for all modals
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// ========================================
// STORM EFFECT: lightning (canvas) + thunder (WebAudio)
// ========================================
(function() {
    const ENABLE_STORM = true;
    if (!ENABLE_STORM) return;

    let canvas, ctx, w, h;
    let bolts = [];
    let lastBoltTime = 0;
    let boltInterval = 3000;
    let rafId;

    function createCanvas() {
        canvas = document.createElement('canvas');
        canvas.className = 'storm-canvas';
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.position = 'fixed';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        ctx.scale(devicePixelRatio, devicePixelRatio);
        resize();
    }

    function resize() {
        if (!canvas) return;
        const pr = devicePixelRatio || 1;
        canvas.width = Math.max(800, window.innerWidth) * pr;
        canvas.height = Math.max(600, window.innerHeight) * pr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx = canvas.getContext('2d');
        ctx.setTransform(pr, 0, 0, pr, 0, 0);
        w = window.innerWidth;
        h = window.innerHeight;
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function makeBolt() {
        const startX = rand(w * 0.1, w * 0.9);
        const segments = Math.floor(rand(8, 18));
        const points = [];
        let x = startX;
        let y = 0;
        points.push({x, y});
        for (let i = 1; i <= segments; i++) {
            x += rand(-60, 60);
            y += (h / segments) + rand(-20, 40);
            points.push({x, y});
            if (y > h) break;
        }
        return { points, life: 1.0, age: 0, width: rand(1.2, 3.5) };
    }

    function drawBolt(bolt, dt) {
        const alpha = Math.max(0, 1 - bolt.age);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = bolt.width * 6;
        ctx.strokeStyle = `rgba(120,190,255,${0.15 * alpha})`;
        ctx.shadowColor = 'rgba(120,220,255,0.8)';
        ctx.shadowBlur = 40 * alpha;
        ctx.beginPath();
        bolt.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.lineWidth = bolt.width;
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * alpha})`;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        bolt.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
        bolt.age += dt * 0.002;
    }

    function triggerFlash(intensity = 1) {
        const flash = document.createElement('div');
        flash.className = 'storm-flash';
        flash.style.opacity = Math.min(1, 0.6 + intensity * 0.4);
        document.body.appendChild(flash);
        setTimeout(() => { flash.remove(); }, 220 + intensity * 200);
    }

    function loop(ts) {
        rafId = requestAnimationFrame(loop);
        const now = performance.now();
        const dt = (now - (loop._last || now)) || 16;
        loop._last = now;

        ctx.clearRect(0, 0, w, h);

        for (let i = bolts.length - 1; i >= 0; i--) {
            const b = bolts[i];
            drawBolt(b, dt);
            if (b.age >= b.life) bolts.splice(i, 1);
        }

        if (now - lastBoltTime > rand(boltInterval * 0.6, boltInterval * 1.6)) {
            lastBoltTime = now;
            const bolt = makeBolt();
            bolts.push(bolt);
            triggerFlash(Math.min(1, bolt.width / 3));
        }
    }

    function initStorm() {
        createCanvas();
        window.addEventListener('resize', resize);
        if (!rafId) rafId = requestAnimationFrame(loop);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initStorm, 300);
    } else {
        document.addEventListener('DOMContentLoaded', initStorm);
    }
})();
