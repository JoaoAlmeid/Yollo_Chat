import path from 'path'
import multer from 'multer'
import fs from 'fs'

const publicFolder = path.resolve(__dirname, '..', '..', 'public')

export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination(req, file, cb) {
      const { typeArch, fileId } = req.body
      let folder

      if (typeArch === "announcements") {
        folder = path.resolve(publicFolder, typeArch)
      } else if (typeArch) {
        folder = path.resolve(publicFolder, typeArch, fileId || "")
      } else {
        folder = publicFolder
      }

      try {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true })
          fs.chmodSync(folder, 0o777)
        }
        
        cb(null, folder)
      } catch (error: any) {
        cb(error, folder)
      }
    },
    filename(req, file, cb) {
      const { typeArch } = req.body
      const sanitizedFileName = file.originalname.replace('/', '-').replace(/ /g, "_")

      const fileName = typeArch == 'announcements' 
        ? `${Date.now()}_${sanitizedFileName}` 
        : sanitizedFileName

      cb(null, fileName)
    }
  }),
}
