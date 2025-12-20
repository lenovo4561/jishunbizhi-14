const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const distPath = path.join(__dirname, '../dist')

console.log('📦 验证构建包大小...\n')

try {
  const rpksFile = fs.readdirSync(distPath).find(f => f.endsWith('.rpks'))

  if (!rpksFile) {
    console.error('❌ 未找到 .rpks 文件，请先执行 npm run build')
    process.exit(1)
  }

  const rpksPath = path.join(distPath, rpksFile)

  // 使用 unzip -l 列出文件
  const output = execSync(`unzip -l "${rpksPath}"`, { encoding: 'utf-8' })
  const lines = output.split('\n')

  let baseSize = 0
  const subpackages = {}

  lines.forEach(line => {
    const match = line.match(/(\d+)\s+\d+-\d+-\d+\s+\d+:\d+\s+(.+\.srpk)/)
    if (match) {
      const size = parseInt(match[1])
      const fileName = match[2]

      if (fileName.includes('.base.srpk')) {
        baseSize = size
      } else {
        const packageName = fileName.match(/\.(\w+)\.srpk/)?.[1] || 'unknown'
        subpackages[packageName] = size
      }
    }
  })

  // 验证主包大小
  const maxSizeKB = 40
  const baseSizeKB = (baseSize / 1024).toFixed(2)

  if (baseSize / 1024 < maxSizeKB) {
    console.log(`✅ 主包 (base): ${baseSizeKB} KB (< ${maxSizeKB} KB)`)
  } else {
    console.log(`❌ 主包 (base): ${baseSizeKB} KB (超出 ${maxSizeKB} KB 限制!)`)
    process.exit(1)
  }

  // 显示分包大小
  Object.entries(subpackages).forEach(([name, size]) => {
    const sizeKB = (size / 1024).toFixed(2)
    console.log(`📦 分包 (${name}): ${sizeKB} KB`)
  })

  console.log('\n✅ 构建验证通过！')
} catch (error) {
  console.error('❌ 验证失败:', error.message)
  process.exit(1)
}
