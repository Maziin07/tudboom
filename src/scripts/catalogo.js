// Sample products data (fallback)
const sampleProducts = [
     
];

// App state
let products = [];
let favorites = [];
let cartItems = [];
let currentCategory = 'all';
let searchTerm = '';

// API Configuration
const API_BASE_URL = 'https://api-tudboom.vercel.app';

// Category icons
const categoryIcons = {
    'Louça': '☕',
    'Escrita e Correção': '🖊️',
    'Cadernos e Papeis': '📓',
    'Equipamento Escolar e Escritório': '📏',
    'Personalizado': '🎨'
};

// DOM elements
const searchInputs = document.querySelectorAll('#searchInput, #mobileSearchInput');
const categoryFilters = document.getElementById('categoryFilters');
const productsGrid = document.getElementById('catalogo');
const productsTitle = document.getElementById('productsTitle');
const productsCount = document.getElementById('productsCount');
const noProducts = document.getElementById('noProducts');
const noProductsText = document.getElementById('noProductsText');
const toastContainer = document.getElementById('toastContainer');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();

    // Animação no header
    const header = document.querySelector('.header');
    if (header) {
        header.classList.add('animated');
    }

    // Monitora mudanças no localStorage para sincronização em tempo real
    window.addEventListener('storage', function(e) {
        if (e.key === 'tudboom_products' || e.key === 'products') {
            loadProducts();
            renderProducts();
        }
    });
});

async function initializeApp() {
    setupEventListeners();
    
    // Mostra loading enquanto carrega os produtos
    showLoadingState();
    
    // Carrega produtos do banco de dados
    await loadProducts();
    
    // Remove loading e renderiza a interface
    hideLoadingState();
    renderCategories();
    renderProducts();
}

function setupEventListeners() {
    searchInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', handleSearch);
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function handleSearch(e) {
    searchTerm = e.target.value.toLowerCase();
    searchInputs.forEach(input => {
        if (input && input !== e.target) input.value = e.target.value;
    });
    renderProducts();
}

function renderCategories() {
    if (!categoryFilters) return;
    
    const categories = getCategories();
    const totalProducts = products.length;

    let categoriesHTML = `
        <button class="category-btn ${currentCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">
            Todos os Produtos
            <span class="category-count">${totalProducts}</span>
        </button>
    `;

    categories.forEach(category => {
        categoriesHTML += `
            <button class="category-btn ${currentCategory === category.id ? 'active' : ''}" onclick="selectCategory('${category.id}')">
                ${category.icon ? category.icon + ' ' : ''}${category.name}
                <span class="category-count">${category.count}</span>
            </button>
        `;
    });

    categoryFilters.innerHTML = categoriesHTML;
}

function getCategories() {
    const categoryCount = {};

    products.forEach(product => {
        const categoryId = product.category.toLowerCase();
        if (!categoryCount[categoryId]) {
            categoryCount[categoryId] = {
                id: categoryId,
                name: product.category,
                count: 0,
                icon: categoryIcons[product.category] || '📦'
            };
        }
        categoryCount[categoryId].count++;
    });

    return Object.values(categoryCount);
}

function selectCategory(categoryId) {
    currentCategory = categoryId;
    renderCategories();
    renderProducts();
    updateProductsTitle();
}

function updateProductsTitle() {
    if (!productsTitle) return;
    
    if (currentCategory === 'all') {
        productsTitle.textContent = 'Todos os Produtos';
    } else {
        const categories = getCategories();
        const category = categories.find(cat => cat.id === currentCategory);
        productsTitle.textContent = category ? category.name : 'Produtos';
    }
}

function renderProducts() {
    if (!productsGrid || !productsCount) return;
    
    const filteredProducts = getFilteredProducts();
    const count = filteredProducts.length;
    productsCount.textContent = `${count} produto${count !== 1 ? 's' : ''}`;

    if (!count) {
        productsGrid.style.display = 'none';
        if (noProducts) {
            noProducts.style.display = 'block';
            if (noProductsText) {
                noProductsText.textContent = searchTerm ? `Não encontramos produtos para "${searchTerm}"` : 'Não há produtos nesta categoria no momento';
            }
        }
        return;
    }

    productsGrid.style.display = 'grid';
    if (noProducts) {
        noProducts.style.display = 'none';
    }

    productsGrid.innerHTML = filteredProducts.map((product, index) => createProductCard(product, index)).join('');
    updateProductsTitle();
}

function getFilteredProducts() {
    return products.filter(product => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = currentCategory === 'all' || product.category.toLowerCase() === currentCategory;
        return matchesSearch && matchesCategory;
    });
}

function createProductCard(product, index) {
    const isFavorite = favorites.includes(product.id);
    const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    // ✅ CORREÇÃO: Usar imagemId se o produto veio do banco de dados
    let imageUrl;
    if (product.imagemId) {
        // Produto do banco - usar ID da imagem
        imageUrl = `${API_BASE_URL}/imagem/${product.imagemId}`;
    } else if (product.image && product.image.startsWith('http')) {
        // Produto de exemplo - usar URL direta
        imageUrl = product.image;
    } else {
        // Fallback para imagem padrão
        imageUrl = '/assets/imagens/produto-default.jpg';
    }

    console.log(`Produto: ${product.name} - ImagemID: ${product.imagemId} - URL: ${imageUrl}`);

    return `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-badges">
                ${product.isNew ? '<div class="product-badge new">Novo</div>' : ''}
                ${product.isOnSale && discountPercentage > 0 ? `<div class="product-badge sale">-${discountPercentage}%</div>` : ''}
            </div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${product.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
            </button>
            <div class="product-image">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     loading="lazy" 
                     onerror="console.error('Erro ao carregar imagem:', this.src); this.src='/assets/imagens/produto-default.jpg'">
                <div class="product-overlay"></div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${createStarRating(product.rating || 5)}
                    <span class="rating-text">(${product.rating || 5})</span>
                </div>
                <div class="product-price">
                    <span class="price-current">R$ ${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="price-original">R$ ${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <a href="/src/pages/detalhes-produto.html?id=${product.id}" class="add-to-cart-btn">𝗦𝗔𝗕𝗘𝗥 𝗠𝗔𝗜𝗦</a>
            </div>
        </div>
    `;
}

function createStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? '' : 'empty'}">★</span>`;
    }
    return stars;
}

function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(productId);
    renderProducts();
}

function clearFilters() {
    searchTerm = '';
    currentCategory = 'all';
    searchInputs.forEach(input => {
        if (input) input.value = '';
    });
    renderCategories();
    renderProducts();
}

function showToast(description, title = '', type = 'success') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${title ? `<div class="toast-title">${title}</div>` : ''}<div class="toast-description">${description}</div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoadingState() {
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p>Carregando produtos...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
        loadingState.remove();
    }
}

// Função principal para carregar produtos
async function loadProducts() {
    try {
        console.log('Carregando produtos do banco de dados...');
        
        // Primeiro tenta carregar do banco de dados
        const databaseProducts = await fetchProductsFromDatabase();
        
        if (databaseProducts && databaseProducts.length > 0) {
            console.log(`${databaseProducts.length} produtos carregados do banco de dados`);
            
            // ✅ CORREÇÃO: Converte produtos do banco para o formato do catálogo com imagemId
            products = databaseProducts.map((dbProduct) => {
                console.log('Produto do banco:', dbProduct);
                
                // Extrair ID da imagem corretamente (mesmo processo do dashboard)
                let imagemId = null;
                if (dbProduct.urlImagem) {
                    if (typeof dbProduct.urlImagem === 'object' && dbProduct.urlImagem._id) {
                        imagemId = dbProduct.urlImagem._id;
                    } else if (typeof dbProduct.urlImagem === 'string') {
                        imagemId = dbProduct.urlImagem;
                    }
                }

                const produto = {
                    id: dbProduct.id || dbProduct._id,
                    name: dbProduct.nome,
                    price: dbProduct.preco,
                    originalPrice: null,
                    image: null, // Não usar URL direta, usar imagemId
                    imagemId: imagemId, // ✅ ADICIONADO: ID da imagem
                    category: dbProduct.categoria || 'Personalizado',
                    description: dbProduct.descricao || '',
                    isNew: isProductNew(dbProduct),
                    isOnSale: false,
                    rating: 5,
                };

                console.log('Produto convertido:', produto);
                return produto;
            });
            
            // Combina com produtos de exemplo
            const combinedProducts = [...products, ...sampleProducts];
            products = removeDuplicateProducts(combinedProducts);
            
            // Salva no localStorage como cache
            saveProductsToCache();
            
        } else {
            console.log('Nenhum produto encontrado no banco, usando produtos de exemplo');
            loadProductsFromCache();
        }
        
    } catch (error) {
        console.error('Erro ao carregar produtos do banco:', error);
        showToast('Erro ao carregar produtos do servidor. Usando dados locais.', 'Aviso', 'warning');
        loadProductsFromCache();
    }
}

// Função para buscar produtos do banco de dados
async function fetchProductsFromDatabase() {
    try {
        const response = await fetch(`${API_BASE_URL}/getItems`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta do servidor:', data);
        
        return data;
        
    } catch (error) {
        console.error('Erro na requisição para o banco:', error);
        throw error;
    }
}

// Função para carregar produtos do cache local
function loadProductsFromCache() {
    try {
        // Tenta carregar produtos da chave principal do catálogo
        const savedProducts = localStorage.getItem('tudboom_products');
        if (savedProducts) {
            products = JSON.parse(savedProducts);
            console.log('Produtos carregados do cache local');
        } else {
            // Se não há produtos salvos, verifica se há produtos no dashboard
            const dashboardProducts = localStorage.getItem('products');
            if (dashboardProducts) {
                const dashboardData = JSON.parse(dashboardProducts);
                // Converte formato do dashboard para o catálogo
                products = dashboardData.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    originalPrice: null,
                    image: p.image,
                    imagemId: p.imagemId, // ✅ ADICIONADO: Preservar imagemId
                    category: 'Personalizado',
                    description: p.description,
                    isNew: true,
                    isOnSale: false,
                    rating: 5,
                    criadoEm: p.criadoEm
                }));
                
                console.log('Produtos convertidos do dashboard local');
            } else {
                // Se não há produtos em lugar nenhum, usa os de exemplo
                products = [...sampleProducts];
                console.log('Usando produtos de exemplo');
            }
            
            // Salva no formato do catálogo
            saveProductsToCache();
        }
    } catch (e) {
        console.error('Erro ao carregar produtos do cache:', e);
        products = [...sampleProducts];
    }
}

// Função para salvar produtos no cache
function saveProductsToCache() {
    try {
        localStorage.setItem('tudboom_products', JSON.stringify(products));
    } catch (e) {
        console.error('Erro ao salvar produtos no cache:', e);
    }
}

// Função para verificar se um produto é novo (criado nos últimos 30 dias)
function isProductNew(product) {
    if (!product.createdAt && !product._id) return false;
    
    try {
        // Se tem campo createdAt, usa ele
        if (product.createdAt) {
            const createdDate = new Date(product.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
        }
        
        // Se não tem createdAt, tenta extrair data do ObjectId
        if (product._id && typeof product._id === 'string' && product._id.length === 24) {
            const timestamp = parseInt(product._id.substring(0, 8), 16) * 1000;
            const createdDate = new Date(timestamp);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
        }
        
        return false;
    } catch (error) {
        console.error('Erro ao verificar se produto é novo:', error);
        return false;
    }
}

// Função para remover produtos duplicados
function removeDuplicateProducts(productList) {
    const uniqueProducts = [];
    const seenIds = new Set();
    const seenNames = new Set();
    
    productList.forEach(product => {
        const id = product.id || product._id;
        const name = product.name || product.nome;
        
        // Evita duplicatas por ID ou nome
        if (!seenIds.has(id) && !seenNames.has(name)) {
            seenIds.add(id);
            seenNames.add(name);
            uniqueProducts.push(product);
        }
    });
    
    return uniqueProducts;
}

// Função para recarregar produtos (pode ser chamada externamente)
async function reloadProducts() {
    showLoadingState();
    await loadProducts();
    hideLoadingState();
    renderCategories();
    renderProducts();
}

// Expor funções globais necessárias
window.selectCategory = selectCategory;
window.toggleFavorite = toggleFavorite;
window.clearFilters = clearFilters;
window.reloadProducts = reloadProducts;