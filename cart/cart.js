import { getPedidos, deleteProducto, agregarPedido, eliminarProductos } from "../firebase.js";

const tbody = document.getElementById('tbody');

// Carga la tabla con datos
function updateTable(querySnapshot) {
    const columnNames = [
        "Producto",
        "Precio",
        "Talle",
        "Cantidad",
        "Subtotal",
        "Eliminar"
    ];

    let html = `
        <thead>
            <tr>${columnNames.map(columnName => `<th class="th">${columnName}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

    let total = 0;

    querySnapshot.forEach((doc) => {
        const producto = doc.data();

        const cantidad = producto.cantidad || 1;
        const subtotal = producto.precio * cantidad;

        total += subtotal;

        html += `
            <tr>
                <td class="nombre">${producto.nombre}</td>
                <td class="precio">$${producto.precio}</td>
                <td class="talle columnaT-angosta">
                    <select class="form-select">
                        <option selected>Talle</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                    </select>
                </td>
                <td class="cantidad columnaC-angosta">
                    <input type="number" class="form-control cantidad-input" value="${cantidad}" min="1">
                </td>
                <td class="subtotal">$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger eliminar-pedido" data-id="${doc.id}">
                        <i class="bi bi-trash icono-trash"></i>
                    </button>
                </td>
            </tr>`;
    });

    html += `</tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="4" id="total">TOTAL</td>
                <td class="total" id="total">$${total.toFixed(2)}</td>
                <td></td>
            </tr>
        </tfoot>`;

    return html;
}


// Función para cargar los productos en la tabla
const cargarProductosEnTabla = async () => {
    try {
        // Obtener los productos desde Firestore
        const querySnapshot = await getPedidos();

        // Verifica si hay datos en querySnapshot
        console.log(querySnapshot);

        // Limpiar el contenido actual de la tabla
        tbody.innerHTML = '';

        // Agregar los datos a la tabla
        tbody.innerHTML = updateTable(querySnapshot);

        // Agregar manejador de eventos para cada botón eliminar-pedido
        const botonesEliminar = document.querySelectorAll('.eliminar-pedido');
        botonesEliminar.forEach((boton) => {
            boton.addEventListener('click', async (e) => {
                const productoId = e.currentTarget.getAttribute('data-id');
                console.log("Producto ID a eliminar:", productoId);

                // Llamar a la función deleteProducto que ya está definida
                await deleteProducto(productoId);

                // Volver a cargar la tabla después de eliminar el producto
                cargarProductosEnTabla();
            });
        });

        const cantidadInputs = document.querySelectorAll('.cantidad-input');
        cantidadInputs.forEach((input) => {
            input.addEventListener('input', actualizarSubtotal);
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }

    // Función para actualizar los subtotales
    function actualizarSubtotal(event) {
        const input = event.target;
        const fila = input.closest('tr');
        const precio = parseFloat(fila.querySelector('.precio').textContent.replace('$', ''));
        const cantidad = parseInt(input.value) || 1;
        const subtotal = precio * cantidad;

        // Actualiza el valor en la columna de subtotal
        fila.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;

        // Vuelve a calcular y actualiza el total
        recalcularTotal();
    }

    // Función para recalcular y actualizar el total
    function recalcularTotal() {
        let total = 0;

        // Obtén todas las filas de la tabla
        const filasProductos = document.querySelectorAll('#tbody tr');

        // Itera sobre cada fila y suma los subtotales
        filasProductos.forEach((fila) => {
            const subtotalElement = fila.querySelector('.subtotal');
            if (subtotalElement) {
                const subtotal = parseFloat(subtotalElement.textContent.replace('$', ''));
                total += isNaN(subtotal) ? 0 : subtotal;
            }
        });

        // Actualiza el valor en la columna de total
        const totalElement = document.querySelector('.total');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
};

//Agregar Pedido
document.getElementById('btnComprar').addEventListener('click', async (e) => {
    e.preventDefault();
    if (document.getElementById('signup-form').checkValidity()) {
        try {
            // Obtener la información del formulario de usuario
            const nombreUsuario = document.getElementById('name').value;
            const apellidoUsuario = document.getElementById('surname').value;
            const emailUsuario = document.getElementById('signup-email').value;
            const telefonoUsuario = document.getElementById('phone').value;
            const domicilioUsuario = document.getElementById('address').value;
        
            // Crear un objeto de pedido con la información necesaria
            const pedido = {
                usuario: {
                    nombre: nombreUsuario,
                    apellido: apellidoUsuario,
                    email: emailUsuario,
                    telefono: telefonoUsuario,
                    domicilio: domicilioUsuario,
                },
                productos: [],  // Un array para almacenar los productos en el pedido
            };
        
            // Obtener todos los elementos de la tabla de productos
            const filasProductos = document.querySelectorAll('#tbody tr');
        
            // Iterar sobre cada fila de productos y agregarlos al pedido
            filasProductos.forEach((fila) => {
                const nombreElement = fila.querySelector('.nombre');
                const precioElement = fila.querySelector('.precio');
                const talleElement = fila.querySelector('.talle select');
                const cantidadElement = fila.querySelector('.cantidad-input');
                const subtotalElement = fila.querySelector('.subtotal');
        
                if (nombreElement && precioElement && talleElement && cantidadElement && subtotalElement) {
                    const nombre = nombreElement.textContent.trim();
                    const precio = parseFloat(precioElement.textContent.replace('$', ''));
                    const talle = talleElement.value;
                    const cantidad = parseInt(cantidadElement.value) || 1;
                    const subtotal = parseFloat(subtotalElement.textContent.replace('$', ''));
        
                    // Agregar el producto al array de productos en el pedido
                    pedido.productos.push({
                        nombre: nombre,
                        precio: precio,
                        talle: talle,
                        cantidad: cantidad,
                        subtotal: subtotal,
                    });
                }
            });
        
            // Calcular el total del pedido sumando los subtotales de cada producto
            const totalPedido = pedido.productos.reduce((total, producto) => total + producto.subtotal, 0);
        
            // Incluir el total en la información del pedido
            pedido.total = totalPedido;
        
            // Llama a la función para agregar el pedido a la colección "pedidos"
            await agregarPedido(pedido);
        
            // Limpiar el formulario de usuario después de agregar el pedido
            document.getElementById('signup-form').reset();
        
            await eliminarProductos();
            alert('Muchas Gracias por su compra!!!. Un vendedor se pondrá en contacto con usted')
            window.location.href = '../index.html';
        
            // Volver a cargar la tabla después de agregar el pedido
            cargarProductosEnTabla();
        } catch (error) {
            console.error('Error al procesar la compra:', error);
        }
    } else {
        // El formulario no es válido, puedes mostrar un mensaje o realizar otras acciones
        alert('Por favor, complete el formulario con todos los campos.');
    }
});

// Llamar a la función para cargar los productos al cargar la página
cargarProductosEnTabla();
