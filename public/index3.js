

// Note: The product data and renderProducts function have been removed 
// because the products are now hard-coded in index.html.

// Search functionality
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');

// This function will not work without the products array.
// It needs to be re-implemented based on the static HTML.
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const allProducts = document.querySelectorAll('.box');

    allProducts.forEach(product => {
        const productName = product.querySelector('h2').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', handleSearch);
searchIcon.addEventListener('click', handleSearch);

// Sign-in functionality
const signInButton = document.querySelector('.nav-signin');

signInButton.addEventListener('click', () => {
    // This correctly redirects the user to the sign-in page.
    window.location.href = 'signin.html';
});

// Cart functionality
const cartButton = document.querySelector('.nav-cart');

cartButton.addEventListener('click', () => {
    console.log('Cart clicked');
});

// Responsive menu
const panelOps = document.querySelector('.panel-ops');
const menuIcon = document.createElement('i');
menuIcon.classList.add('fa-solid', 'fa-bars', 'panel-icon');

function toggleMenu() {
    panelOps.classList.toggle('show');
}

function setupMenu() {
    if (window.innerWidth < 768) {
        if (!document.querySelector('.panel-icon')) {
            panelOps.parentNode.insertBefore(menuIcon, panelOps);
            menuIcon.addEventListener('click', toggleMenu);
        }
        panelOps.classList.remove('show');
    } else {
        if (document.querySelector('.panel-icon')) {
            document.querySelector('.panel-icon').remove();
        }
        panelOps.classList.add('show');
    }
}

window.addEventListener('resize', setupMenu);
// Initial setup
setupMenu();