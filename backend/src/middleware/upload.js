// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadProdutos = path.join(__dirname, '..', '..', 'uploads', 'produtos');
const uploadEmpresas = path.join(__dirname, '..', '..', 'uploads', 'empresas');

// Garante que as pastas existem
if (!fs.existsSync(uploadProdutos)) fs.mkdirSync(uploadProdutos, { recursive: true });
if (!fs.existsSync(uploadEmpresas)) fs.mkdirSync(uploadEmpresas, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Logos de empresas vão para /uploads/empresas/
    const isLogo = req.route?.path?.includes('empresas') || req.baseUrl?.includes('empresas');
    const dir = isLogo ? uploadEmpresas : uploadProdutos;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nome = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, nome);
  },
});

const fileFilter = (req, file, cb) => {
  const tipos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (tipos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPG, PNG ou WEBP são permitidas'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
