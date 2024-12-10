import { agregarProducto } from "../firebase.js";

const URL = "./products.json";
const container = document.querySelector('div.container');

function retornarCard(producto) {
  return `
    <div class="card bg-dark">
        <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="d-block w-100 img-thumbnail">
                </div>
                <div class="carousel-item">
                    <img src="${producto.imagen2}" alt="${producto.nombre}" class="d-block w-100 img-thumbnail">
                </div>
            </div>            
        </div>
        <div class="card-body text-white">
            <div class="card-name">${producto.nombre}</div>
            <div class="card-price">$${producto.precio}</div>
            <div class="card-stock">Stock: ${producto.stock}</div>
            <div class="card-button d-grid gap-2">
              <button class="btn text-white btn-lg" data-id="${producto.id}" title="Clic para agregar al carrito" ${producto.stock === 0 ? 'disabled' : ''}>Pedir<i class="bi bi-cart"></i></button>
            </div>
        </div>
    </div>`;
}

function activarClickEnBotones(productos) {
  container.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
      const productoSeleccionado = productos.find(
        (producto) => producto.id === parseInt(e.target.dataset.id)
      );
      if (productoSeleccionado) {
        await agregarProducto(productoSeleccionado);
        alert("Producto agregado al carrito");
      }
    }
  });
}

function cargarProductos(array) {
  container.innerHTML = ""; // Limpiar el contenedor
  array.forEach((producto) => {
    container.innerHTML += retornarCard(producto);
  });
  activarClickEnBotones(array); // Pasar array como parámetro
}

const obtenerProductos = () => {
  fetch(URL)
    .then((response) => response.json())
    .then((data) => cargarProductos(data));
};

obtenerProductos();
