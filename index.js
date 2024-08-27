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

