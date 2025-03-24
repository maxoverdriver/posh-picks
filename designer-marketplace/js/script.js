// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Initialize Cart
    updateCartCount();
    
    // Add to Cart Buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId);
            showToast('Product added to cart!', 'success');
        });
    });
    
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Here you would typically send this to your backend
            console.log('Newsletter signup:', email);
            this.reset();
            showToast('Thank you for subscribing!', 'success');
        });
    }
    
    // Initialize product page functionality if on product page
    initProductPage();
    
    // Initialize checkout page functionality if on checkout page
    initCheckoutPage();
});

// Cart Functions
function addToCart(productId) {
    // In a real app, you would fetch the product details from an API
    // For demo purposes, we'll use dummy data
    const product = {
        id: productId,
        name: `Product ${productId}`,
        price: Math.floor(Math.random() * 100) + 20,
        image: 'images/placeholder.html'
    };
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
    }
    saveCart();
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count, #mobile-cart-count');
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = cartCount;
        }
    });
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center py-4">Your cart is empty</p>';
        if (cartTotalElement) cartTotalElement.textContent = '$0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="flex items-center">
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <div class="ml-4 flex items-center">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners to the newly created elements
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
    
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity + 1);
            }
        });
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <div class="toast-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Add close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Product Page Functions
function initProductPage() {
    const productPage = document.querySelector('.product-detail-page');
    if (!productPage) return;
    
    // Thumbnail gallery
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image');
    
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Update main image
                mainImage.src = this.src;
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Add to cart button on product page
    const addToCartBtn = document.querySelector('.product-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const quantity = parseInt(document.querySelector('.product-quantity').value) || 1;
            
            // Add to cart multiple times based on quantity
            for (let i = 0; i < quantity; i++) {
                addToCart(productId);
            }
            
            showToast(`${quantity} item(s) added to cart!`, 'success');
        });
    }
}

// Checkout Page Functions
function initCheckoutPage() {
    const checkoutPage = document.querySelector('.checkout-page');
    if (!checkoutPage) return;
    
    updateCartDisplay();
    
    // Checkout form validation
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('border-red-500');
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            if (!isValid) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // In a real app, you would process the payment with Stripe here
            // For demo purposes, we'll just show a success message
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<div class="spinner mx-auto"></div>';
            
            // Simulate API call
            setTimeout(() => {
                // Clear cart
                cart = [];
                saveCart();
                updateCartCount();
                
                // Redirect to confirmation page
                window.location.href = 'order-confirmation.html';
            }, 2000);
        });
    }
}

// Stripe Integration (Placeholder)
function initStripeElements() {
    // This would be replaced with actual Stripe integration code
    console.log('Stripe Elements initialized');
    
    // In a real implementation, you would do something like:
    /*
    const stripe = Stripe('your-publishable-key');
    const elements = stripe.elements();
    
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');
    
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
    */
}

// Admin Dashboard Functions (Placeholder)
function initAdminDashboard() {
    const adminDashboard = document.querySelector('.admin-dashboard');
    if (!adminDashboard) return;
    
    console.log('Admin dashboard initialized');
    
    // In a real implementation, you would fetch products, orders, etc. from your backend
    // and populate the dashboard with that data
}

// Fetch Products (Placeholder)
function fetchProducts() {
    // In a real app, you would fetch products from an API
    // For demo purposes, we'll use dummy data
    return new Promise((resolve) => {
        setTimeout(() => {
            const dummyProducts = [
                {
                    id: '1',
                    name: 'Designer Handbag',
                    description: 'Inspired by luxury fashion',
                    price: 129.99,
                    image: 'images/placeholder.html',
                    category: 'bags',
                    tags: ['new', 'featured'],
                    stock: 10
                },
                {
                    id: '2',
                    name: 'Designer Watch',
                    description: 'Elegant timepiece',
                    price: 89.99,
                    originalPrice: 119.99,
                    image: 'images/placeholder.html',
                    category: 'watches',
                    tags: ['sale', 'featured'],
                    stock: 5
                },
                {
                    id: '3',
                    name: 'Designer Sunglasses',
                    description: 'UV protection included',
                    price: 59.99,
                    image: 'images/placeholder.html',
                    category: 'accessories',
                    tags: ['featured'],
                    stock: 15
                },
                {
                    id: '4',
                    name: 'Designer Wallet',
                    description: 'Premium quality material',
                    price: 49.99,
                    image: 'images/placeholder.html',
                    category: 'accessories',
                    tags: ['popular', 'featured'],
                    stock: 20
                }
            ];
            
            products = dummyProducts;
            resolve(dummyProducts);
        }, 500);
    });
}

// Initialize products on shop page
function initShopPage() {
    const shopPage = document.querySelector('.shop-page');
    if (!shopPage) return;
    
    fetchProducts().then(products => {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;
        
        let productsHTML = '';
        
        products.forEach(product => {
            productsHTML += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition product-card">
                    <div class="relative">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover product-image">
                        ${product.tags.includes('new') ? '<div class="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">New</div>' : ''}
                        ${product.tags.includes('sale') ? '<div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Sale</div>' : ''}
                        ${product.tags.includes('popular') ? '<div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Popular</div>' : ''}
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                        <p class="text-gray-600 mb-2">${product.description}</p>
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-indigo-600 font-bold">$${product.price.toFixed(2)}</span>
                                ${product.originalPrice ? `<span class="text-gray-400 line-through ml-2">$${product.originalPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <button class="add-to-cart bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition" data-id="${product.id}">
                                <i class="fas fa-shopping-cart mr-1"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        productsContainer.innerHTML = productsHTML;
        
        // Add event listeners to the newly created elements
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);
                showToast('Product added to cart!', 'success');
            });
        });
    });
}