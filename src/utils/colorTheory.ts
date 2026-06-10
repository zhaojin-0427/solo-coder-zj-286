import type { ColorAnalysis, StyleType } from '@/types'
import { hexToRgb, rgbToHsl } from './colorExtractor'

interface HSL {
  h: number
  s: number
  l: number
}

function colorsToHsl(colors: string[]): HSL[] {
  return colors.map(c => {
    const rgb = hexToRgb(c)
    return rgbToHsl(rgb.r, rgb.g, rgb.b)
  })
}

function isNeutral(hsl: HSL): boolean {
  return hsl.s < 15 || (hsl.l < 12 || hsl.l > 88)
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2)
  return Math.min(diff, 360 - diff)
}

export function analyzeColors(colors: string[]): ColorAnalysis {
  if (colors.length === 0) {
    return { style: 'neutral', score: 50, description: '暂无色彩数据', dominantColors: [] }
  }
  const hsls = colorsToHsl(colors)
  const nonNeutrals = hsls.filter(h => !isNeutral(h))
  const allNeutral = nonNeutrals.length === 0

  if (allNeutral) {
    return {
      style: 'neutral',
      score: 85,
      description: '全中性色搭配，经典百搭不出错',
      dominantColors: colors,
    }
  }

  let style: StyleType = 'analogous'
  let score = 60
  let description = ''

  const hues = nonNeutrals.map(h => h.h)
  const avgHue = hues.reduce((a, b) => a + b, 0) / hues.length
  let maxHueDist = 0
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      maxHueDist = Math.max(maxHueDist, hueDistance(hues[i], hues[j]))
    }
  }

  const neutralRatio = (hsls.length - nonNeutrals.length) / hsls.length

  if (maxHueDist < 25) {
    style = 'monochromatic'
    score = Math.min(95, 75 + neutralRatio * 15)
    description = '同色系搭配，简约高级，视觉非常统一'
  } else if (maxHueDist > 150) {
    style = 'complementary'
    score = Math.min(92, 65 + neutralRatio * 25)
    description = '互补色对比强烈，醒目大胆，视觉冲击力强'
  } else if (maxHueDist < 80) {
    style = 'analogous'
    score = Math.min(90, 72 + neutralRatio * 18)
    description = '邻近色搭配，柔和协调，自然舒适'
  } else {
    style = 'analogous'
    score = Math.min(82, 60 + neutralRatio * 20)
    description = '多色搭配，层次丰富，注意比例控制'
  }

  if (nonNeutrals.length >= 2) {
    const sats = nonNeutrals.map(h => h.s)
    const satVar = Math.max(...sats) - Math.min(...sats)
    if (satVar > 50) score = Math.max(40, score - 10)
    const lights = nonNeutrals.map(h => h.l)
    const lightContrast = Math.max(...lights) - Math.min(...lights)
    if (lightContrast > 20 && lightContrast < 60) score = Math.min(100, score + 5)
  }

  return {
    style,
    score: Math.round(score),
    description,
    dominantColors: colors,
  }
}

export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const compH = (hsl.h + 180) % 360
  return hslToHex(compH, hsl.s, hsl.l)
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const col = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * col).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
