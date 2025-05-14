const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Puerto del servidor
const PORT = 8001;

//-- Página de error
const error = fs.readFileSync('./Pages/error.html', 'utf8');

//-- Función para leer archivos
function leerFichero(fichero, callback) {
    fs.readFile(fichero, (err, data) => {
        if (err) {
            console.error('No se puede leer el archivo:', fichero, err);
            callback(err, null);
        } else {
            console.log(`Lectura correcta de ${fichero}`);
            callback(null, data);
        }
    });
}

//-- Función para generar lista de archivos
function listarArchivos(carpeta, callback) {
    fs.readdir(carpeta, (err, files) => {
        if (err) {
            console.error('No se puede leer el directorio:', carpeta, err);
            callback(err, null);
        } else {
            callback(null, files);
        }
    });
}

//-- Crear servidor
const server = http.createServer((req, res) => {
    console.log('Petición recibida:', req.url);

    let content_type;
    let recurso;

    //-- Rutas normales para recursos estáticos
    if (req.url.endsWith('.png') || req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) {
        content_type = req.url.endsWith('.png') ? 'image/png' : 'image/jpeg';
        recurso = path.join(__dirname, 'Images', path.basename(req.url));

    } else if (req.url.endsWith('.css')) {
        content_type = 'text/css';
        recurso = path.join(__dirname, 'Style', path.basename(req.url));

    } else if (req.url.endsWith('.js')) {
        content_type = 'application/javascript';
        recurso = path.join(__dirname, 'JS', path.basename(req.url)); 

    } else if (req.url.endsWith('.html')) {
        content_type = 'text/html';
        recurso = path.join(__dirname, 'Pages', path.basename(req.url));

    } else if (req.url === '/' || req.url === '/index.html') {
        content_type = 'text/html';
        recurso = path.join(__dirname, 'Pages', 'index.html');

    //-- Ruta para /ls (listar archivos)
    } else if (req.url === '/ls') {
        content_type = 'text/html';
        listarArchivos(__dirname, (err, files) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end('<h1>Error al listar los archivos</h1>');
            } else {
                let listaHTML = '<h1>Listado de Archivos</h1><ul>';
                files.forEach(file => {
                    listaHTML += `<li>${file}</li>`;
                });
                listaHTML += '</ul>';
                res.statusCode = 200;
                res.setHeader('Content-Type', content_type);
                res.end(listaHTML);
            }
        });
        return;  // Finaliza la ejecución para evitar otros bloques

    } else {
        content_type = 'text/html';
        recurso = null;
    }

    //-- Leer y enviar recurso
    if (recurso) {
        leerFichero(recurso, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html');
                res.end(error);
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', content_type);
                res.end(data);
            }
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(error);
    }
});

server.listen(PORT, () => {
    console.log('Servidor escuchando en http://localhost:' + PORT);
});
