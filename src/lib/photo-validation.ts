export interface PhotoValidationResult {
  isValid: boolean
  issues: string[]
  scores: {
    brightness: number
    blur: number
    size: number
  }
}

export async function validatePhotoQuality(file: File): Promise<PhotoValidationResult> {
  return new Promise((resolve) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const issues: string[] = []
      
      // Test de luminosité
      const brightness = calculateBrightness(imageData)
      if (brightness < 60) {
        issues.push("Photo trop sombre - rapprochez-vous d'une fenêtre")
      } else if (brightness > 200) {
        issues.push("Photo surexposée - éloignez-vous de la lumière directe")
      }
      
      // Test de netteté (approximatif)
      const blur = calculateBlur(imageData)
      if (blur < 10) {
        issues.push("Photo floue - stabilisez votre téléphone")
      }
      
      // Test de résolution
      const minResolution = 300
      if (img.width < minResolution || img.height < minResolution) {
        issues.push("Résolution trop faible - rapprochez-vous")
      }
      
      // Test de ratio (approximatif pour détecter un visage centré)
      const isSquareish = Math.abs(img.width - img.height) / Math.max(img.width, img.height) < 0.3
      if (!isSquareish && img.width > img.height * 2) {
        issues.push("Cadrage trop large - centrez votre visage")
      }
      
      resolve({
        isValid: issues.length === 0,
        issues,
        scores: {
          brightness,
          blur,
          size: Math.min(img.width, img.height)
        }
      })
    }
    
    img.src = URL.createObjectURL(file)
  })
}

function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data
  let sum = 0
  let count = 0
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    sum += (r + g + b) / 3
    count++
  }
  
  return sum / count
}

function calculateBlur(imageData: ImageData): number {
  // Approximation simple du flou via variance des pixels
  const data = imageData.data
  const values: number[] = []
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
    values.push(gray)
  }
  
  const mean = values.reduce((a, b) => a + b) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  
  return Math.sqrt(variance)
}