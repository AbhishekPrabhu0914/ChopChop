import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserData {
  id: string
  email: string
  items: GroceryItem[]
  recipes: Recipe[]
  created_at?: string
  updated_at?: string
}

export interface GroceryItem {
  item: string
  category: string
  needed_for: string
  priority: 'high' | 'medium' | 'low'
  checked: boolean
}

export interface Recipe {
  name: string
  description: string
  cooking_time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  servings: string
  ingredients_needed: Array<{
    name: string
    amount: string
    available: boolean
  }>
  instructions: string[]
  tips: string
}

// Database operations
export class SupabaseService {
  static async saveUserData(email: string, items: GroceryItem[], recipes: Recipe[]): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .insert({
          email,
          items: JSON.stringify(items),
          recipes: JSON.stringify(recipes)
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving user data:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Error saving user data:', error)
      return null
    }
  }

  static async getUserData(email: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return null
      }

      return {
        id: data.id,
        email: data.email,
        items: data.items ? JSON.parse(data.items) : [],
        recipes: data.recipes ? JSON.parse(data.recipes) : [],
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  static async updateUserData(email: string, items: GroceryItem[], recipes: Recipe[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_data')
        .update({
          items: JSON.stringify(items),
          recipes: JSON.stringify(recipes),
          updated_at: new Date().toISOString()
        })
        .eq('email', email)

      if (error) {
        console.error('Error updating user data:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating user data:', error)
      return false
    }
  }

  static async sendEmail(email: string, items: GroceryItem[], recipes: Recipe[]): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          items,
          recipes
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }
}
