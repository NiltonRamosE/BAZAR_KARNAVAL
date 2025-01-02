import KEYS from "./keys.js"

const $d = document;
const $productos = $d.getElementById("contenedor-productos");
const $template = $d.getElementById("section-productos").content;
const $fragment = $d.createDocumentFragment();
const options = { headers: {Authorization: `Bearer ${KEYS.secret}`}}

const FormatoDeMoneda = num => `${num.slice(0, -2)}.${num.slice(-2)}`;

let products, prices;

Promise.all([
    fetch("https://api.stripe.com/v1/products", options),
    fetch("https://api.stripe.com/v1/prices", options)
])
.then(responses => Promise.all(responses.map(res => res.json())))
.then(json => {
    products = json[0].data;
    prices = json[1].data;
    cargarProductos(products);
})
.catch(error => {
    let message = error.statuText || "Ocurrió un error en la petición";

    $productos.innerHTML = `Error: ${error.status}: ${message}`;
})


function cargarProductos(productosElegidos) {
    prices.forEach(el => {
        let productData = productosElegidos.filter(product => product.id === el.product);
        if (productData.length > 0) {
            $template.querySelector(".producto").setAttribute("data-price", el.id);
            $template.querySelector(".producto-imagen").src = productData[0].images[0];
            $template.querySelector(".producto-imagen").alt = productData[0].name;
            $template.querySelector(".producto-detalles").querySelector(".producto-titulo").innerHTML = `${productData[0].name}`;
            $template.querySelector(".producto-detalles").querySelector(".producto-precio").innerHTML = `S/. ${FormatoDeMoneda(el.unit_amount_decimal)} ${(el.currency).toUpperCase()}`;
			$template.querySelector(".producto-detalles").querySelector(".producto-agregar").id = productData[0].id;
            let $clone = $d.importNode($template, true);
            $fragment.appendChild($clone);
        } else {
            console.warn(`Producto no encontrado para el precio con id: ${el.id}`);
        }
    });
    
    $productos.innerHTML = "";
    $productos.appendChild($fragment);
    
    actualizarBotonesAgregar();
}


const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");


botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}))

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {

        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
			
            const productoCategoria = products.find(producto => producto.metadata.categoria_id === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.metadata.categoria_nombre;
            const productosBoton = products.filter(producto => producto.metadata.categoria_id === e.currentTarget.id);
            
            cargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(products);
        }

    })
});

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}

function agregarAlCarrito(e) {

    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #4b33a8, #785ce9)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
          },
        onClick: function(){}
      }).showToast();

    const idBoton = e.currentTarget.id;
    const productoAgregado = products.find(producto => producto.id === idBoton);
	
	productoAgregado.precio = prices.filter(el => el.product === productoAgregado.id)
    .map(el => `${FormatoDeMoneda(el.unit_amount_decimal)}`)
	
	productoAgregado.id_precio = prices.filter(el => el.product === productoAgregado.id)
    .map(el => `${el.id}`)
    
	console.log(typeof productoAgregado.precio);
	console.log(productoAgregado);
    if(productosEnCarrito.some(producto => producto.id === idBoton)) {
		console.log(productosEnCarrito);
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
        console.log(productosEnCarrito);
    }

    actualizarNumerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

