// Variables declaration
let cartElements = [];
let products = [];
const paginationItems = 5;

/**
 * Adding an element to the cart
 * 
 * @param {event} event 
 * @param {string} id
 */
const addToCart = (event, id) => {
    updateCart(event, () => { productExits(id) ? updateCartItem(id, 'add') : addNewItemToCart(id) });
};

/**
 * Substracting an element from the cart
 * 
 * @param {event} event 
 * @param {string} id
 */
const substactFromCart = (event, id) => {
    updateCart(event, () => {
        if (productExits(id)) {
            updateCartItem(id, 'substract');
        }
    });
};

/**
 * Substracting an element from the cart
 * 
 * @param {event} event 
 * @param {string} id
 */
const deleteFromCart = (event, id) => {
    updateCart(event, () => { updateCartItem(id, 'delete'); });
};

/**
 * Updating cart elements by excecuting a custom action
 * 
 * @param {event} event 
 * @param {function} action
 */
const updateCart = (event, action) => {
    event.preventDefault();
    action();
    updateCartQuantity();
    updateCartSummary();
};

/**
 * Verify if a product exist within the cart
 * 
 * @param {string} id
 * @return {boolean}
 */
const productExits = (id) => {
    return cartElements.some((item) => item.id === id);
};

/**
 * Updates the number of the items within my cart
 * by reducing the array and making a count of items.
 */
const updateCartQuantity = () => {
    const count = cartElements.reduce((acumulador, valorActual) => acumulador + valorActual.quantity, 0);
    document.getElementById('cart-items').innerHTML = count;
};

/**
 * Updating the quantity of an item in my cart
 * 
 * @param {string} id 
 * @param {string} type 
 */
const updateCartItem = (id, type) => {
    if (type === 'delete') {
        cartElements = cartElements.filter((item) => {
            return item.id !== id;
        });
    } else {
        cartElements.map((item) => {
            if (item.id === id) {
                switch (type) {
                    case 'add':
                        item.quantity += 1;
                        break;
                    case 'substract':
                        item.quantity > 1 ? item.quantity -= 1 : updateCartItem(id, 'delete');
                        break;
                }
            }
            return item;
        });
    }
};

/**
 * Add a new item in my cart
 * 
 * @param {string} id 
 */
const addNewItemToCart = (id) => {
    // Adding to cart
    cartElements.push({
        id: id,
        quantity: 1
    });
};

/**
 * Getting the product from the cart and its details
 * 
 * @param {object} product
 * @return {object}
 */
const getCartProduct = (product) => {
    const productData = products.find((item) => item.id === product.id);
    return { ...product, ...productData };
}

/**
 * Updating summary of the cart items
 */
const updateCartSummary = () => {
    let cartSummaryHTML = '';

    cartElements.forEach((product) => {
        const productInformation = getCartProduct(product);

        cartSummaryHTML += `
            <div class="col-3">
                <div class="card">
                    <div class="card-body">
                    <h5 class="card-title">${productInformation.name}</h5>
                    <p class="card-text price">$${productInformation.price} ${productInformation.currency}</p>
                    <p class="card-text">Quantity ${productInformation.quantity}</p>
                    </div>
                </div>
            </div>`;
    });

    document.getElementById('cart-summary').innerHTML = cartSummaryHTML;
}

/**
 * Loads the products within the page.
 */
const printProductsList = (search = null) => {
    let productsHTML = '';

    // Filter products

    const filteredProducts = products
        //.filter((product) => {
            // pagina de producto coincide => propiedad que agregamos con el map de page, con la que debo mostrar
            // URL => si tiene parametro page => usar este valor para saber q lo muestras
            // si no tiene parametro page (?page=1) => mostrar la primera pagina
        // })
        // https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    .filter((product) => {
        let showProduct = true;
        if (search) {
            const productName = product.name.toLowerCase();
            const searchQuery = search.toLowerCase();
            // Reto: Usar expresion regular
            // https://www.codecademy.com/resources/docs/javascript/regexp
            // https://regex101.com/

            showProduct = productName.includes(searchQuery);
        }
        return showProduct;
    });

    if (filteredProducts.length > 0) {
        // There are results
        filteredProducts.forEach((product) => {
            productsHTML += `
                <div class="col-3">
                    <div class="card">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text price">$${product.price} ${product.currency}</p>
                        <a href="#" class="btn btn-primary" onClick="addToCart(event, '${product.id}')">+</a>
                        <span>0</span>
                        <a href="#" class="btn btn-primary" onClick="substactFromCart(event, '${product.id}')">-</a>
                        <a href="#" class="btn btn-primary" onClick="deleteFromCart(event, '${product.id}')">Delete All</a>
                        </div>
                    </div>
                </div>`;
        });

        document.getElementById('products-list').innerHTML = productsHTML;
    } else {
        // There are not results
        document.getElementById('products-list').innerHTML = 'No results found';
    }
}

/**
 * Create an Ajax Loader to perform API Calls
 */
const ajaxLoader = (method, path)=> {
    return new Promise((resolve, reject) => {
        // MAKE API CALL
        // Prepare a variable for the HTTP request
        let request;

        // Setup the request variable according the browser
        if (window.XMLHttpRequest) { // Mozilla, Safari, ...
            request = new XMLHttpRequest();
        } else if (window.ActiveXObject) { // IE
            request = new ActiveXObject("Microsoft.XMLHTTP");
        }

        // When the state of the request changes, do something
        request.onreadystatechange = function() {
            // if the case is 4 => completed
            if (request.readyState === 4) {
                if (request.status == 200) {
                    // IS SUCCESS
                    resolve(JSON.parse(request.responseText));
                } else {
                    // AN ERROR OCCURED
                    reject({
                        status: request.status,
                        message: 'Sorry, Something went wrong'
                    });
                }
            }
        };

        // Open a connection to the provided URL
        // By using the Method gotten
        request.open(method, path);
    
        // Do the request
        request.send();
    });
};


/**
 * Loads the products within the page.
 */
const loadProducts = () => {
    ajaxLoader('GET', 'https://61101b8dc848c900171b3a84.mockapi.io/products')
        .then((response) => {
            // FILL THE VARIABLE PRODUCTS WITH THE RESPONSE
            products = response;

            // IMPLEMENT PAGINATION

            // Map products array (info del producto, index) to add a new property to define the page number
                // Dividir length entre los items de paginacion 17 / 5 => multiplos (4)
                // Asignar a que pagina pertenece basada en el index

                /*
                    {
                        "name": "Sleek Granite Bike",
                        "description": "Carbonite web goalkeeper gloves are ergonomically designed to give easy fit",
                        "color": "black",
                        "image": "http://placeimg.com/640/480/city",
                        "currency": "MGA",
                        "price": "853.00",
                        "id": "1",
                        "page": 1
                    },
                */

                // segun el numero de paginas crear los links de navegcion en el html (id div)
                // hacer un for de cada pagina => para que agregue un enlace con el href del link ?page=1
                // si en la url tines el parametro agregarle la clase active al elemento activo (url)
                // si el elemento esta activo tambien agregarle la palabra current
                /*

                    <nav>
                        <!-- href del link => url actual agregandole ?page=1 -->
                        <ul class="pagination">
                        <li class="page-item"><a class="page-link" href="?">1</a></li>
                        <li class="page-item ">
                            <a class="page-link" href="#">2 <span class="sr-only">(current)</span></a>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        </ul>
                    </nav>
                */

            // PRINT THE PRODUCT LIST IN THE PAGE
            printProductsList();
        })
        .catch(error => {
            console.error(error);
            // IS NOT SUCCESS
            // SAY TO THE USER THAT SOMETHING WENT WRONG
            document.body.innerHTML = `
                <div class="error-page">
                    <div class="container">
                        <div class="row">
                            <div class="col-1"><h1>:(</h1></div>
                            <div class="col-11">
                                <h2>${error.message}</h2>
                                <p>Código del error: ${error.status}</p>
                            </div>
                        </div>                            
                    </div>
                </div>
            `;
        });
};

/**
 * Performing a Search.
 */
const doSearch = (event) => {
    event.preventDefault();
    const search = document.getElementById('search').value;
    printProductsList(search);
};

// When the document is loaded, then I load the products.
loadProducts();
