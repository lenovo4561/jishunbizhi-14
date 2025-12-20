const fs = require('fs')
const path = require('path')

// 转换比例：250 / 1080
const ratio = 250 / 1080

// 需要处理的目录
const srcDir = path.join(__dirname, '../src')

// 递归查找所有 .ux 文件
function findUxFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)

  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat && stat.isDirectory()) {
      results = results.concat(findUxFiles(filePath))
    } else if (file.endsWith('.ux')) {
      results.push(filePath)
    }
  })

  return results
}

// 转换尺寸值
function convertPxValue(match, value) {
  const numValue = parseFloat(value)
  const converted = Math.round(numValue * ratio)
  return `${converted}px`
}

// 处理单个文件
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // 匹配 数字px 的模式，但保留小数
  const newContent = content.replace(/(\d+(?:\.\d+)?)px/g, (match, value) => {
    modified = true
    const numValue = parseFloat(value)
    const converted = Math.round(numValue * ratio)
    return `${converted}px`
  })

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8')
    console.log(`✓ 已处理: ${path.relative(srcDir, filePath)}`)
    return true
  }

  return false
}

// 主函数
function main() {
  console.log('开始转换设计宽度从 1080 到 250...\n')
  console.log(`转换比例: ${ratio.toFixed(4)}\n`)

  const uxFiles = findUxFiles(srcDir)
  console.log(`找到 ${uxFiles.length} 个 .ux 文件\n`)

  let processedCount = 0

  uxFiles.forEach(file => {
    if (processFile(file)) {
      processedCount++
    }
  })

  console.log(`\n完成! 共处理了 ${processedCount} 个文件。`)
}

main()
