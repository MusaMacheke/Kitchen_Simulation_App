export interface Dish {
    id: string
    name: string
    preparationTime: number
    complexity: number
    status?: "pending" | "preparing" | "completed"
    chefId?: number | null
    chefName?: string
    progress?: number
    startTime?: Date
    endTime?: Date
  }
  
  export interface Order {
    id: string
    dishes: Dish[]
    status: "pending" | "in-progress" | "completed"
    priority: number
    timestamp: Date
  }
  
  export interface Chef {
    id: number
    name: string
    status: "available" | "busy"
    currentDish: {
      orderId: string
      dishName: string
      dishId: string
      startTime: Date
      endTime: Date
      progress?: number
      remainingTime?: number
    } | null
  }
  