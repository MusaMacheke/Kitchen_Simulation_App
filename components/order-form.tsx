"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Dish, Order } from "@/lib/types"
import { Clock, ChefHat, AlertTriangle } from "lucide-react"

interface OrderFormProps {
  dishes: Dish[]
  onSubmit: (order: Order) => void
}

export function OrderForm({ dishes, onSubmit }: OrderFormProps) {
  const [selectedDishes, setSelectedDishes] = useState<string[]>([])
  const [priority, setPriority] = useState<number>(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedDishes.length === 0) return

    const orderId = Math.random().toString(36).substring(2, 8).toUpperCase()

    const orderDishes = selectedDishes.map((dishId) => {
      const dish = dishes.find((d) => d.id === dishId)!
      return {
        id: Math.random().toString(36).substring(2, 10),
        name: dish.name,
        preparationTime: dish.preparationTime,
        complexity: dish.complexity,
        status: "pending" as const,
        chefId: null,
      }
    })

    const newOrder: Order = {
      id: orderId,
      dishes: orderDishes,
      status: "pending",
      priority,
      timestamp: new Date(),
    }

    onSubmit(newOrder)

    // Reset form
    setSelectedDishes([])
    setPriority(1)
  }

  const handleDishToggle = (dishId: string) => {
    setSelectedDishes((prev) => (prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]))
  }

  const getTotalPrepTime = () => {
    return dishes
      .filter((dish) => selectedDishes.includes(dish.id))
      .reduce((total, dish) => total + dish.preparationTime, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place New Order</CardTitle>
        <CardDescription>Select dishes and set priority</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Available Dishes</h3>
              {selectedDishes.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Est. preparation time: {getTotalPrepTime()} seconds</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`flex items-start space-x-3 rounded-lg border p-4 ${
                    selectedDishes.includes(dish.id) ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <Checkbox
                    id={dish.id}
                    checked={selectedDishes.includes(dish.id)}
                    onCheckedChange={() => handleDishToggle(dish.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={dish.id}
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dish.name}
                    </Label>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{dish.preparationTime}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-3.5 w-3.5" />
                        <span>Complexity: {Array(dish.complexity).fill("★").join("")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Order Priority</h3>
            <RadioGroup
              value={priority.toString()}
              onValueChange={(value) => setPriority(Number.parseInt(value))}
              className="grid grid-cols-1 md:grid-cols-3 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="1" id="priority-1" />
                <Label htmlFor="priority-1" className="flex-1">
                  Normal
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="2" id="priority-2" />
                <Label htmlFor="priority-2" className="flex-1">
                  High
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="3" id="priority-3" />
                <Label htmlFor="priority-3" className="flex-1">
                  VIP
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={selectedDishes.length === 0}>
            {selectedDishes.length === 0 ? (
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Select at least one dish
              </span>
            ) : (
              `Place Order (${selectedDishes.length} dishes)`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
