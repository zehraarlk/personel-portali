import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.doc': 'application/msword',
  '.xls': 'application/vnd.ms-excel',
}

/**
 * Proje kökündeki /images klasörünü hem dev hem build'de /images olarak sunar.
 * @param {string} projectRoot - repo kökü (personel-portali-main)
 * @param {{ copyOnBuild?: boolean }} [options]
 *   copyOnBuild: frontend build'de dist/images'e kopyala.
 *   Admin (base=/admin/) kopyalamamalı — URL'ler /images/... (site kökü) bekler.
 */
export function rootImagesPlugin(projectRoot, options = {}) {
  const { copyOnBuild = true } = options
  const imagesDir = path.resolve(projectRoot, 'images')
  let outDir = ''

  return {
    name: 'root-images',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const raw = req.url?.split('?')[0] || ''
          if (!raw.startsWith('/images/') && raw !== '/images') {
            next()
            return
          }

          const rel = decodeURIComponent(raw.replace(/^\/images\/?/, ''))
          const filePath = path.resolve(imagesDir, rel)

          if (!filePath.startsWith(imagesDir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            next()
            return
          }

          const ext = path.extname(filePath).toLowerCase()
          res.statusCode = 200
          res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
          res.setHeader('Cache-Control', 'public, max-age=0')
          await pipeline(fs.createReadStream(filePath), res)
        } catch {
          if (!res.headersSent) next()
        }
      })
    },
    closeBundle() {
      if (!copyOnBuild || !outDir || !fs.existsSync(imagesDir)) return
      const target = path.join(outDir, 'images')
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.cpSync(imagesDir, target, { recursive: true, force: true })
    },
  }
}
