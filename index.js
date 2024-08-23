fetch('../navbar.html')
.then(response => response.text())
.then(data => {
  document.getElementById('navbar-placeholder').innerHTML = data;
})
.catch(error => console.error('Error cargando el nav:', error));
