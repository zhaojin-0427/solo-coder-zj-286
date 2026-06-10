interface RGB {
  r: number
  g: number
  b: number
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function getContrastColor(colors: RGB[]): RGB {
  const n = colors.length
  if (n === 0) return { r: 128, g: 128, b: 128 }
  let minR = 255, maxR = 0
  let minG = 255, maxG = 0
  let minB = 255, maxB = 0
  for (const c of colors) {
    minR = Math.min(minR, c.r); maxR = Math.max(maxR, c.r)
    minG = Math.min(minG, c.g); maxG = Math.max(maxG, c.g)
    minB = Math.min(minB, c.b); maxB = Math.max(maxB, c.b)
  }
  return {
    r: Math.round((maxR - minR) / 255 > 0.3 ? (maxR + minR) / 2 : 128),
    g: Math.round((maxG - minG) / 255 > 0.3 ? (maxG + minG) / 2 : 128),
    b: Math.round((maxB - minB) / 255 > 0.3 ? (maxB + minB) / 2 : 128),
  }
}

function kmeans(pixels: RGB[], k: number, maxIter = 8): RGB[] {
  if (pixels.length === 0) return []
  if (pixels.length <= k) return pixels
  const centroids: RGB[] = []
  const step = Math.floor(pixels.length / k)
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[i * step] })
  }
  for (let iter = 0; iter < maxIter; iter++) {
    const clusters: RGB[][] = centroids.map(() => [])
    for (const pixel of pixels) {
      let minDist = Infinity
      let bestIdx = 0
      for (let i = 0; i < centroids.length; i++) {
        const c = centroids[i]
        const dist = Math.pow(pixel.r - c.r, 2) + Math.pow(pixel.g - c.g, 2) + Math.pow(pixel.b - c.b, 2)
        if (dist < minDist) { minDist = dist; bestIdx = i }
      }
      clusters[bestIdx].push(pixel)
    }
    let changed = false
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length === 0) continue
      let sumR = 0, sumG = 0, sumB = 0
      for (const p of clusters[i]) { sumR += p.r; sumG += p.g; sumB += p.b }
      const newC: RGB = {
        r: Math.round(sumR / clusters[i].length),
        g: Math.round(sumG / clusters[i].length),
        b: Math.round(sumB / clusters[i].length),
      }
      if (newC.r !== centroids[i].r || newC.g !== centroids[i].g || newC.b !== centroids[i].b) {
        changed = true
        centroids[i] = newC
      }
    }
    if (!changed) break
  }
  return centroids
}

export async function extractColors(imageSrc: string, colorCount = 4): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const maxSize = 80
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(['#888888']); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels: RGB[] = []
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          const a = imageData.data[i + 3]
          if (a < 125) continue
          const hsl = rgbToHsl(r, g, b)
          if (hsl.l < 8 || hsl.l > 92) continue
          pixels.push({ r, g, b })
        }
        if (pixels.length < 10) { resolve(['#CCCCCC']); return }
        const clusters = kmeans(pixels, Math.min(colorCount, Math.max(2, Math.floor(pixels.length / 50))))
        const result = clusters.map(c => rgbToHex(c.r, c.g, c.b))
        resolve(result.length > 0 ? result : ['#888888'])
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}

export { rgbToHex, hexToRgb, rgbToHsl }
