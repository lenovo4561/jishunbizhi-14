const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const logoPath = path.join(__dirname, '../src/assets/images/logo.png')
const outputPath = path.join(__dirname, '../src/assets/images/logo.png')

// 备份原文件
const backupPath = path.join(
  __dirname,
  '../src/assets/images/logo_original.png'
)

async function compressLogo() {
  try {
    // 先备份原文件
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(logoPath, backupPath)
      console.log('Original logo backed up to:', backupPath)
    }

    // 压缩并调整尺寸到 192x192
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({
        quality: 80,
        compressionLevel: 9
      })
      .toFile(outputPath + '.tmp')

    // 替换原文件
    fs.unlinkSync(outputPath)
    fs.renameSync(outputPath + '.tmp', outputPath)

    const stats = fs.statSync(outputPath)
    console.log('Logo compressed successfully!')
    console.log('New size:', (stats.size / 1024).toFixed(2), 'KB')
    console.log('Dimensions: 192x192')
  } catch (error) {
    console.error('Error compressing logo:', error)
  }
}

compressLogo()
