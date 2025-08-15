export interface SkinAnalysis {
  skinType: string
  concerns: string[]
  products: Product[]
  routine: {
    morning: string[]
    evening: string[]
  }
}

export interface Product {
  name: string
  brand: string
  price: string
  link: string
  category: string
}

export interface QuestionnaireData {
  age: string
  sensitivities: string[]
  currentRoutine: string
  mainConcern: string
  budget: string
  routineComplexity: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}