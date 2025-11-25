document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const collection = urlParams.get('collection');

    function updateCartIcon() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = cartCount;
        }
    }

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === product.size);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Item added to cart!');
        updateCartIcon();
    }

    if (productId && collection) {
        let jsonFile;
        if (collection === 'ladies') {
            jsonFile = '../women-products.json';
        } else if (collection === 'men') {
            jsonFile = '../products.json';
        } else if (collection === 'kids') {
            jsonFile = '../kids-products.json';
        } else if (collection === 'home') {
            jsonFile = '../home-products.json';
        } else {
            const container = document.querySelector('.container') || document.querySelector('.product-detail-container') || document.body;
            container.innerHTML = '<h1>Invalid collection</h1>';
            return;
        }

        fetch(jsonFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                let product = products.find(p => p.id === parseInt(productId));

                if (!product && collection === 'men') {
                    return fetch('../home-products.json')
                        .then(response => response.json())
                        .then(homeProducts => {
                            product = homeProducts.find(p => p.id === parseInt(productId));
                            return product;
                        });
                }
                return product;
            })
            .then(product => {
                if (product) {
                    const productImage = document.querySelector('.product-image img');
                    if (productImage) {
                        productImage.src = '../' + product.image;
                        productImage.alt = product.name;
                    }

                    const productName = document.querySelector('.product-name');
                    if (productName) {
                        productName.textContent = product.name;
                    }

                    const productPrice = document.querySelector('.product-price');
                    if (productPrice) {
                        if (typeof product.price === 'number') {
                            productPrice.textContent = '$' + product.price.toFixed(2);
                        } else {
                            productPrice.textContent = product.price;
                        }
                    }

                    const colorName = document.querySelector('.color-name');
                    if (colorName && product.color) {
                        colorName.textContent = product.color;
                    }

                    const colorSwatch = document.querySelector('.color-swatch');
                    if (colorSwatch && product.color) {
                        colorSwatch.style.backgroundColor = product.color;
                    }

                    const sizeButtons = document.querySelectorAll('.sizes button');
                    let selectedSize = null;

                    sizeButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            sizeButtons.forEach(btn => btn.classList.remove('selected'));
                            button.classList.add('selected');
                            selectedSize = button.textContent;
                        });
                    });

                    const addToBagButton = document.querySelector('.add-to-bag');
                    if (addToBagButton) {
                        addToBagButton.addEventListener('click', () => {
                            if (selectedSize) {
                                let priceValue;
                                if (typeof product.price === 'string') {
                                    priceValue = parseFloat(product.price.replace('$', '').replace('₹', '').replace(',', ''));
                                } else {
                                    priceValue = parseFloat(product.price);
                                }
                                
                                const productForCart = {
                                    id: product.id.toString(),
                                    name: product.name,
                                    price: priceValue,
                                    image: '../' + product.image,
                                    size: selectedSize,
                                    quantity: 1
                                };
                                addToCart(productForCart);
                            } else {
                                alert('Please select a size first.');
                            }
                        });
                    }

                } else {
                    const container = document.querySelector('.container') || document.querySelector('.product-detail-container') || document.body;
                    container.innerHTML = '<h1>Product not found</h1>';
                }
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                const container = document.querySelector('.container') || document.querySelector('.product-detail-container') || document.body;
                container.innerHTML = '<h1>Error loading product data</h1>';
            });
    } else {
        const container = document.querySelector('.container') || document.querySelector('.product-detail-container') || document.body;
        container.innerHTML = '<h1>No product selected</h1>';
    }
});