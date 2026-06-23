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

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function getProductFromStorage(productId) {
    try {
        const stored = localStorage.getItem('laet-products');
        const products = stored ? JSON.parse(stored) : initialProducts;
        return products.find(p => p.id === productId);
    } catch (error) {
        return initialProducts.find(p => p.id === productId) || null;
    }
}

function getContact() {
    try {
        return JSON.parse(localStorage.getItem('laet-contact')) || { whatsapp: '', instagram: '' };
    } catch {
        return { whatsapp: '', instagram: '' };
    }
}

function buildDetailSpecs(product) {
    const specs = [];
    specs.push({ label: 'Categoria', value: product.categoryLabel });
    specs.push({ label: 'Situação', value: product.badgeText || 'Disponível' });
    specs.push({ label: 'Parcelamento', value: product.installment || 'Não disponível' });
    specs.push({ label: 'Garantia', value: '6 meses' });
    specs.push({ label: 'Entrega', value: 'Frete rápido para todo o Brasil' });
    return specs;
}

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
    storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="M6 8h4M6 12h4M6 16h4"></path>
        <circle cx="16" cy="12" r="2"></circle>
    </svg>`,
    headset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>`,
    gpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        <circle cx="7" cy="12" r="2"></circle>
        <circle cx="17" cy="12" r="2"></circle>
        <path d="M12 6V4M8 6V4M16 6V4M12 18v2M8 18v2M16 18v2"></path>
    </svg>`,
    webcam: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="10" r="8"></circle>
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M12 18v4M8 22h8"></path>
    </svg>`
};

function buildDescription(product) {
    if (product.description) return product.description;
    return `Conheça o ${product.name}, um produto ${product.categoryLabel.toLowerCase()} com design moderno e desempenho confiável. Ideal para quem busca qualidade, preço competitivo e entrega rápida.`;
}

function renderProductDetail(product) {
    document.title = `${product.name} | LAET IMPORTS`;
    document.getElementById('detail-category').textContent = product.categoryLabel;
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-price').textContent = formatCurrency(product.price);
    document.getElementById('detail-old-price').textContent = product.oldPrice ? formatCurrency(product.oldPrice) : '';
    document.getElementById('detail-installment').textContent = product.installment || '';
    const descEl = document.getElementById('detail-description');
    const descText = buildDescription(product);
    descEl.innerHTML = descText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/ {2,}/g, m => '&nbsp;'.repeat(m.length));

    const detailImage = document.getElementById('detail-image');
    const imageUrls = product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []);

    if (imageUrls.length) {
        detailImage.innerHTML = `
            <div class="product-detail-gallery">
                <div class="product-detail-main-image" id="main-gallery-image">
                    <img src="${imageUrls[0]}" alt="${product.name}">
                </div>
                <div class="gallery-nav">
                    <button class="gallery-btn" id="gallery-prev" type="button" aria-label="Imagem anterior">‹</button>
                    <button class="gallery-btn" id="gallery-next" type="button" aria-label="Próxima imagem">›</button>
                </div>
                <div class="gallery-thumbnails" id="gallery-thumbnails">
                    ${imageUrls.map((url, index) => `
                        <button type="button" class="gallery-thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${url}" alt="Foto ${index + 1}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        let currentIndex = 0;
        const mainImage = document.querySelector('#main-gallery-image img');
        const thumbButtons = document.querySelectorAll('.gallery-thumb');
        const prevButton = document.getElementById('gallery-prev');
        const nextButton = document.getElementById('gallery-next');

        const showImage = (index) => {
            if (index < 0) index = imageUrls.length - 1;
            if (index >= imageUrls.length) index = 0;
            currentIndex = index;
            if (mainImage) mainImage.src = imageUrls[index];
            thumbButtons.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.index, 10) === index));
        };

        prevButton?.addEventListener('click', () => showImage(currentIndex - 1));
        nextButton?.addEventListener('click', () => showImage(currentIndex + 1));
        thumbButtons.forEach(btn => btn.addEventListener('click', () => showImage(parseInt(btn.dataset.index, 10))));

        let startX = null;
        let dragDistance = 0;
        const galleryMain = document.getElementById('main-gallery-image');
        galleryMain?.addEventListener('pointerdown', (e) => { startX = e.clientX; dragDistance = 0; });
        galleryMain?.addEventListener('pointermove', (e) => {
            if (startX !== null) dragDistance = e.clientX - startX;
        });
        galleryMain?.addEventListener('pointerup', (e) => {
            if (startX === null) return;
            const diff = e.clientX - startX;
            if (diff > 40) showImage(currentIndex - 1);
            if (diff < -40) showImage(currentIndex + 1);
            startX = null;
        });

        // Abre a imagem em tela cheia ao clicar (ignora cliques que foram, na verdade, um arrasto/swipe)
        galleryMain?.addEventListener('click', () => {
            if (Math.abs(dragDistance) < 10) openLightbox(currentIndex);
        });

        // Monta o lightbox (visualização em tela cheia) uma única vez por carregamento da página
        document.getElementById('image-lightbox')?.remove();
        const lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'image-lightbox-overlay';
        lightbox.innerHTML = `
            <button type="button" class="image-lightbox-close" aria-label="Fechar imagem">&times;</button>
            ${imageUrls.length > 1 ? `
                <button type="button" class="image-lightbox-nav image-lightbox-prev" aria-label="Imagem anterior">‹</button>
                <button type="button" class="image-lightbox-nav image-lightbox-next" aria-label="Próxima imagem">›</button>
            ` : ''}
            <img class="image-lightbox-img" src="" alt="${product.name}">
        `;
        document.body.appendChild(lightbox);
        const lightboxImg = lightbox.querySelector('.image-lightbox-img');

        function openLightbox(index) {
            lightboxImg.src = imageUrls[index];
            lightbox.classList.add('active');
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('image-lightbox-close')) {
                closeLightbox();
            }
        });
        lightbox.querySelector('.image-lightbox-prev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex - 1);
            lightboxImg.src = imageUrls[currentIndex];
        });
        lightbox.querySelector('.image-lightbox-next')?.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex + 1);
            lightboxImg.src = imageUrls[currentIndex];
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') { showImage(currentIndex - 1); lightboxImg.src = imageUrls[currentIndex]; }
            if (e.key === 'ArrowRight') { showImage(currentIndex + 1); lightboxImg.src = imageUrls[currentIndex]; }
        });
    } else {
        detailImage.innerHTML = `<div class="product-image-icon">${icons[product.icon] || icons.laptop}</div>`;
    }

    const specs = buildDetailSpecs(product);
    const specsEl = document.getElementById('detail-specs');
    specsEl.innerHTML = specs.map(spec => `
        <li>
            <strong>${spec.label}</strong>
            <span>${spec.value}</span>
        </li>
    `).join('');

    // Set contact buttons
    const contact = getContact();
    const waBtn = document.getElementById('detail-whatsapp-btn');
    const igBtn = document.getElementById('detail-instagram-btn');

    if (waBtn) {
        const rawNumber = contact.whatsapp ? contact.whatsapp.replace(/\D/g, '') : '';
        const waLabel = waBtn.querySelector('.btn-contact-label');
        if (rawNumber) {
            const msg = `Olá! Tenho interesse no produto: *${product.name}* — ${formatCurrency(product.price)}`;
            waBtn.href = `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
            if (waLabel) waLabel.textContent = `+${rawNumber}`;
        } else {
            waBtn.href = '#';
            if (waLabel) waLabel.textContent = 'WhatsApp não configurado';
        }
    }

    if (igBtn) {
        const igLabel = igBtn.querySelector('.btn-contact-label');
        if (contact.instagram) {
            igBtn.href = contact.instagram;
            const handle = contact.instagram.replace(/https?:\/\/(www\.)?instagram\.com\/?/i, '').replace(/\/$/, '');
            if (igLabel) igLabel.textContent = handle ? `@${handle}` : contact.instagram;
        } else {
            igBtn.href = '#';
            if (igLabel) igLabel.textContent = 'Instagram não configurado';
        }
    }
}

function renderNotFound() {
    const container = document.getElementById('product-detail-container');
    container.innerHTML = `
        <div class="product-detail-card detail-not-found">
            <h2>Produto não encontrado</h2>
            <p>O produto selecionado não está disponível no momento. Volte à loja e escolha outro item.</p>
<a href="/" class="btn btn-primary">Voltar à loja</a>
        </div>
    `;
}

const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get('id'), 10);

async function loadProduct() {
    try {
        const res = await apiGet(`/api/products/${productId}`);
        const product = res.product;
        if (product && !Number.isNaN(productId)) return renderProductDetail(product);
    } catch (e) {
        // fallback
        const product = getProductFromStorage(productId);
        if (product && !Number.isNaN(productId)) return renderProductDetail(product);
    }
    renderNotFound();
}

loadProduct();

