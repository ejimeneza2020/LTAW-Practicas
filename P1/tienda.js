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

//-- Crear servidor
const server = http.createServer((req, res) => {
    console.log('Petición recibida:', req.url);

    let content_type;
    let recurso;

    //-- Ruta /ls para listar los ficheros
    if (req.url === '/ls') {
        const directoryPath = path.join(__dirname, 'Pages'); // O la carpeta que desees listar
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end('<h1>Error al leer el directorio</h1>');
                return;
            }

            let fileListHTML = '<h1>Listado de Ficheros</h1><ul>';
            files.forEach(file => {
                fileListHTML += `<li><a href="${file}">${file}</a></li>`;
            });
            fileListHTML += '</ul>';

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(fileListHTML); // Enviar el listado de ficheros como respuesta HTML
        });
    }

    //-- Determinar tipo de contenido y ruta para otras solicitudes
    else if (req.url.endsWith('.png') || req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) {
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
