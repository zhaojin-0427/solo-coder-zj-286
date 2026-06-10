export async function exportCanvasToImage(canvasEl: HTMLElement, filename = 'outfit.png'): Promise<void> {
  const rect = canvasEl.getBoundingClientRect()
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)
  const scale = 2

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建画布上下文')

  ctx.scale(scale, scale)
  const bgColor = getComputedStyle(canvasEl).backgroundColor || '#F5F1EB'
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  const images: Array<{ src: string; x: number; y: number; w: number; h: number }> = []
  const imgs = canvasEl.querySelectorAll('img')
  imgs.forEach(img => {
    const r = img.getBoundingClientRect()
    images.push({
      src: img.src,
      x: r.left - rect.left,
      y: r.top - rect.top,
      w: r.width,
      h: r.height,
    })
  })

  for (const img of images) {
    await new Promise<void>((resolve) => {
      const image = new Image()
      image.crossOrigin = 'Anonymous'
      image.onload = () => {
        ctx!.drawImage(image, img.x, img.y, img.w, img.h)
        resolve()
      }
      image.onerror = () => resolve()
      image.src = img.src
    })
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('导出图片失败')

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
