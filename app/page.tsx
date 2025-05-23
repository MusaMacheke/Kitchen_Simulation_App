"use client"

import { useState, useEffect } from "react"
import { KitchenDashboard } from "@/components/kitchen-dashboard"
import { OrderForm } from "@/components/order-form"
import { ChefManagement } from "@/components/chef-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Dish, Order, Chef } from "@/lib/types"
import { initialDishes } from "@/lib/data"

export default function Home() {
  const [dishes] = useState<Dish[]>(initialDishes)
  const [orders, setOrders] = useState<Order[]>([])
  const [chefs, setChefs] = useState<Chef[]>([
    { id: 1, name: "Chef Alex", status: "available", currentDish: null },
    { id: 2, name: "Chef Bailey", status: "available", currentDish: null },
  ])
  const [completedDishes, setCompletedDishes] = useState<
    {
      dishName: string
      orderId: string
      completedAt: Date
      chefName: string
    }[]
  >([])

  // Check for pending orders whenever a chef becomes available
  useEffect(() => {
    const availableChefs = chefs.filter((chef) => chef.status === "available")
    if (availableChefs.length > 0) {
      const pendingOrders = orders.filter((order) => order.dishes.some((dish) => dish.status === "pending"))

      if (pendingOrders.length > 0) {
        processOrders(orders, chefs)
      }
    }
  }, [chefs, orders])

  const addOrder = (newOrder: Order) => {
    setOrders((prevOrders) => {
      const updatedOrders = [...prevOrders, newOrder]
      // Process orders immediately if there are available chefs
      const availableChefs = chefs.filter((chef) => chef.status === "available")
      if (availableChefs.length > 0) {
        setTimeout(() => {
          processOrders(updatedOrders, chefs)
        }, 0)
      }
      return updatedOrders
    })
  }

  const processOrders = (currentOrders: Order[], availableChefs: Chef[]) => {
    // Find available chefs
    const freeChefs = availableChefs.filter((chef) => chef.status === "available")

    if (freeChefs.length === 0) return // No available chefs

    // Sort orders by priority (VIP first) and then by timestamp
    const sortedOrders = [...currentOrders].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority // Higher priority first
      }
      return a.timestamp.getTime() - b.timestamp.getTime() // Earlier timestamp first
    })

    // Find orders with pending dishes
    for (const order of sortedOrders) {
      const pendingDishes = order.dishes.filter((dish) => dish.status === "pending")

      if (pendingDishes.length > 0 && freeChefs.length > 0) {
        // Assign dish to chef
        const dish = pendingDishes[0]
        const chef = freeChefs.shift()!

        // Update orders state with dish assignment
        setOrders((currentOrders) =>
          currentOrders.map((o) => {
            if (o.id === order.id) {
              return {
                ...o,
                dishes: o.dishes.map((d) => {
                  if (d.id === dish.id) {
                    return {
                      ...d,
                      status: "preparing" as "preparing",
                      chefId: chef.id,
                      chefName: chef.name,
                    }
                  }
                  return d
                }),
              }
            }
            return o
          }),
        )

        // Update chef status
        setChefs((currentChefs) =>
          currentChefs.map((c) => {
            if (c.id === chef.id) {
              return {
                ...c,
                status: "busy" as "busy",
                currentDish: {
                  orderId: order.id,
                  dishName: dish.name,
                  dishId: dish.id,
                  startTime: new Date(),
                  endTime: new Date(Date.now() + dish.preparationTime * 1000),
                },
              }
            }
            return c
          }),
        )

        // Start real-time preparation
        const startTime = new Date()
        const endTime = new Date(startTime.getTime() + dish.preparationTime * 1000)

        const intervalId = setInterval(() => {
          const now = new Date()
          const progress = Math.min(100, ((now.getTime() - startTime.getTime()) / (dish.preparationTime * 1000)) * 100)

          // Update progress in real-time for both orders and chefs
          setOrders((currentOrders) =>
            currentOrders.map((o) => {
              if (o.id === order.id) {
                return {
                  ...o,
                  dishes: o.dishes.map((d) => {
                    if (d.id === dish.id) {
                      return {
                        ...d,
                        progress: Math.round(progress),
                        startTime,
                        endTime,
                      }
                    }
                    return d
                  }),
                }
              }
              return o
            }),
          )

          // Update chef progress
          setChefs((currentChefs) =>
            currentChefs.map((c) => {
              if (c.id === chef.id && c.currentDish?.dishId === dish.id) {
                return {
                  ...c,
                  currentDish: {
                    ...c.currentDish,
                    progress: Math.round(progress),
                    remainingTime: Math.max(0, Math.ceil((endTime.getTime() - now.getTime()) / 1000)),
                  },
                }
              }
              return c
            }),
          )

          // Check if preparation is complete
          if (now >= endTime) {
            clearInterval(intervalId)

            // Update dish status to completed
            setOrders((currentOrders) => {
              const updatedOrders = currentOrders.map((o) => {
                if (o.id === order.id) {
                  return {
                    ...o,
                    dishes: o.dishes.map((d) => {
                      if (d.id === dish.id) {
                        return { ...d, status: "completed" as "completed", progress: 100 }
                      }
                      return d
                    }),
                  }
                }
                return o
              })
              return updatedOrders
            })

            // Add to completed dishes
            setCompletedDishes((prev) => [
              ...prev,
              {
                dishName: dish.name,
                orderId: order.id,
                completedAt: new Date(),
                chefName: chef.name,
              },
            ])

            // Free up the chef and process next orders
            setChefs((currentChefs) => {
              const updatedChefs = currentChefs.map((c) => {
                if (c.id === chef.id) {
                  return { ...c, status: "available" as "available", currentDish: null }
                }
                return c
              })

              // Check for more pending orders after a short delay
              setTimeout(() => {
                setOrders((currentOrders) => {
                  // Check if there are still pending dishes
                  const hasPendingDishes = currentOrders.some((order) =>
                    order.dishes.some((dish) => dish.status === "pending"),
                  )

                  if (hasPendingDishes) {
                    processOrders(currentOrders, updatedChefs)
                  }

                  return currentOrders
                })
              }, 100)

              return updatedChefs
            })
          }
        }, 100) // Update every 100ms for smooth progress
      }
    }
  }

  const addChef = (name: string) => {
    const newChef: Chef = {
      id: Math.max(...chefs.map((c) => c.id), 0) + 1,
      name,
      status: "available",
      currentDish: null,
    }

    setChefs((currentChefs) => {
      const updatedChefs = [...currentChefs, newChef]

      // Process pending orders immediately with the new chef
      setTimeout(() => {
        const pendingOrders = orders.filter((order) => order.dishes.some((dish) => dish.status === "pending"))

        if (pendingOrders.length > 0) {
          // Pass the updated chefs array directly to ensure the new chef is included
          processOrders(orders, updatedChefs)
        }
      }, 0)

      return updatedChefs
    })
  }

  const removeChef = (id: number) => {
    const updatedChefs = chefs.filter((chef) => chef.id !== id)
    setChefs(updatedChefs)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Kitchen Simulation App</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Kitchen Dashboard</TabsTrigger>
          <TabsTrigger value="order">Place Order</TabsTrigger>
          <TabsTrigger value="chefs">Chef Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <KitchenDashboard orders={orders} chefs={chefs} completedDishes={completedDishes} />
        </TabsContent>

        <TabsContent value="order">
          <OrderForm dishes={dishes} onSubmit={addOrder} />
        </TabsContent>

        <TabsContent value="chefs">
          <ChefManagement chefs={chefs} onAddChef={addChef} onRemoveChef={removeChef} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
