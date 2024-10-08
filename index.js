fetch('../navbar.html')
.then(response => response.text())
.then(data => {
  document.getElementById('navbar-placeholder').innerHTML = data;
})
.catch(error => console.error('Error cargando el nav:', error));

fetch('../whatsapp.html')
.then(response => response.text())
.then(data => {
  document.getElementById('whatsapp-placeholder').innerHTML = data;
})
.catch(error => console.error('Error cargando el botón:', error));

// Código para cambiar la imagen en el modal
const imageModal = document.getElementById('imageModal');
imageModal.addEventListener('show.bs.modal', function (event) {
  const button = event.relatedTarget; // Botón que activó el modal
  const imageSrc = button.getAttribute('data-bs-image-src'); // Extraer la ruta de la imagen
  const modalImage = document.getElementById('modal-image');
  modalImage.src = imageSrc; // Asignar la ruta de la imagen al src del modal
});
