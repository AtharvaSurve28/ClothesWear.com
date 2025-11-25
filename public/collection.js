
document.addEventListener('DOMContentLoaded', () => {
    const shopSection = document.querySelector('.shop-section');
    // Determine the collection from a data attribute on the body
    const collection = document.body.dataset.collection;
    
    if (!collection || !shopSection) {
        if(shopSection) shopSection.innerHTML = "<p>Could not load products. Collection not specified.</p>";
        return;
    }

    // Determine which JSON file to use based on the collection
    let jsonFile;
    if (collection === 'ladies') {
        jsonFile = 'women-products.json';
    } else if (collection === 'men') {
        // Assuming 'products.json' is for men's collection as per original structure
        jsonFile = 'products.json';
    } else if (collection === 'kids') {
        jsonFile = 'kids-products.json';
    } else {
        shopSection.innerHTML = '<p>Invalid collection specified.</p>';
        return;
    }

    // Fetch the product data and dynamically create the product grid
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            shopSection.innerHTML = ''; // Clear any existing static content
            products.forEach(product => {
                const productBox = document.createElement('div');
                productBox.classList.add('box');

                // Create the product card with a correct, dynamic link
                productBox.innerHTML = `
                    <div class="box-content">
                        <h2>${product.name}</h2>
                        <a href="product-detail.html?collection=${collection}&id=${product.id}">
                            <div class="box-img" style="background-image: url('${product.image}');"></div>
                        </a>
                    </div>
                `;
                shopSection.appendChild(productBox);
            });
        })
        .catch(error => {
            console.error('Error fetching collection products:', error);
            shopSection.innerHTML = '<p>Error loading products. Please try again later.</p>';
        });
});
