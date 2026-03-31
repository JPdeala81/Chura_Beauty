import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default function handler(req, res) {
  // Construire le chemin du fichier demandé
  let filePath = path.join(__dirname, '../frontend/dist', req.url === '/' ? 'index.html' : req.url)

  // Éviter les path traversal attacks
  const realPath = path.resolve(filePath)
  const baseDir = path.resolve(path.join(__dirname, '../frontend/dist'))
  
  if (!realPath.startsWith(baseDir)) {
    res.status(403).send('Forbidden')
    return
  }

  // Si le fichier n'existe pas et ce n'est pas un asset, servir index.html pour SPA
  if (!fs.existsSync(filePath)) {
    if (!req.url.includes('.') && !req.url.startsWith('/api')) {
      filePath = path.join(__dirname, '../frontend/dist/index.html')
    }
  }

  // Essayer de servir le fichier
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath)
      
      // Déterminer le type MIME
      const ext = path.extname(filePath)
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.map': 'application/json'
      }
      
      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
      res.status(200).send(content)
    } else {
      res.status(404).send('Not Found')
    }
  } catch (error) {
    console.error('Error serving file:', error)
    res.status(500).send('Internal Server Error')
  }
}
