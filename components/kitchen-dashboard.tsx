"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Order, Chef, Dish } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle2, ChefHat, AlertCircle } from "lucide-react"
import { RealTimeTimer } from "@/components/real-time-timer"

interface KitchenDashboardProps {
  orders: Order[]
  chefs: Chef[]
  completedDishes: {
    dishName: string
    orderId: string
    completedAt: Date
    chefName: string
  }[]
}

export function KitchenDashboard({ orders, chefs, completedDishes }: KitchenDashboardProps) {
  const [time, setTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate order progress
  const calculateOrderProgress = (order: Order) => {
    if (order.dishes.length === 0) return 0

    const completedDishes = order.dishes.filter((dish) => dish.status === "completed").length

    return Math.round((completedDishes / order.dishes.length) * 100)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "preparing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return <Badge className="bg-red-500">VIP</Badge>
      case 2:
        return <Badge className="bg-orange-500">High</Badge>
      default:
        return <Badge className="bg-gray-500">Normal</Badge>
    }
  }

  // Calculate total preparation time for an order
  const calculateTotalPrepTime = (order: Order) => {
    return order.dishes.reduce((total, dish) => total + dish.preparationTime, 0)
  }

  // Calculate remaining time for a dish in seconds
  const getRemainingTime = (dish: Dish) => {
    if (!dish.endTime || dish.status === "completed") return 0

    const now = new Date()
    const remainingMs = Math.max(0, dish.endTime.getTime() - now.getTime())
    return Math.ceil(remainingMs / 1000)
  }

  // Count pending orders
  const pendingOrdersCount = orders.filter((order) => order.dishes.some((dish) => dish.status === "pending")).length

  // Count pending dishes
  const pendingDishesCount = orders.reduce((count, order) => {
    return count + order.dishes.filter((dish) => dish.status === "pending").length
  }, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Orders currently being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {orders.filter((order) => order.dishes.some((dish) => dish.status !== "completed")).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Available Chefs</CardTitle>
            <CardDescription>Chefs ready to prepare dishes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {chefs.filter((chef) => chef.status === "available").length} / {chefs.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Dishes</CardTitle>
            <CardDescription>Dishes waiting for a chef</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingDishesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completed Dishes</CardTitle>
            <CardDescription>Dishes ready to be served</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedDishes.length}</div>
          </CardContent>
        </Card>
      </div>

      {pendingDishesCount > 0 && chefs.every((chef) => chef.status === "busy") && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium">
                {pendingDishesCount} {pendingDishesCount === 1 ? "dish is" : "dishes are"} waiting for an available
                chef.
              </p>
              <p className="text-sm text-muted-foreground">
                All chefs are currently busy. Dishes will be prepared when a chef becomes available.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="chefs">Chefs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No orders yet. Place an order to get started.
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Order #{order.id}</CardTitle>
                    {getPriorityBadge(order.priority)}
                  </div>
                  <CardDescription>
                    Placed at {order.timestamp.toLocaleTimeString()}
                    {" • "}
                    {order.dishes.length} {order.dishes.length === 1 ? "dish" : "dishes"}
                    {" • "}
                    Est. time: {calculateTotalPrepTime(order)} sec
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={calculateOrderProgress(order)} className="h-2 mb-4" />

                  <div className="space-y-2">
                    {order.dishes.map((dish) => (
                      <div key={dish.id} className="space-y-2 p-3 rounded-lg border bg-muted/50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(dish.status || "unknown")}>
                              {(dish.status ?? "unknown").charAt(0).toUpperCase() + (dish.status ?? "unknown").slice(1)}
                            </Badge>
                            <span className="font-medium">{dish.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {dish.status === "preparing" ? (
                              <span className="font-medium text-blue-600">{getRemainingTime(dish)}s remaining</span>
                            ) : dish.status === "pending" ? (
                              <span className="font-medium text-yellow-600">Waiting for chef</span>
                            ) : (
                              <span>{dish.preparationTime}s</span>
                            )}
                          </div>
                        </div>

                        {dish.status === "preparing" && dish.chefName && (
                          <div className="flex items-center gap-2 text-sm">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Prepared by: <span className="font-medium text-foreground">{dish.chefName}</span>
                            </span>
                          </div>
                        )}

                        {dish.status === "preparing" && <RealTimeTimer dish={dish} />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="chefs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chefs.map((chef) => (
              <Card key={chef.id} className={chef.status === "available" ? "border-green-200" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      {chef.name}
                    </CardTitle>
                    <Badge className={chef.status === "available" ? "bg-green-500" : "bg-blue-500"}>
                      {chef.status.charAt(0).toUpperCase() + chef.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {chef.status === "busy" && chef.currentDish ? (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p>
                          Currently preparing: <span className="font-medium">{chef.currentDish.dishName}</span>
                        </p>
                        <p>
                          For order: <span className="font-medium">#{chef.currentDish.orderId}</span>
                        </p>
                      </div>

                      {chef.currentDish.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress: {chef.currentDish.progress}%</span>
                            <span>{chef.currentDish.remainingTime || 0}s remaining</span>
                          </div>
                          <Progress value={chef.currentDish.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="text-green-600 font-medium">Available for next dish</p>
                      {pendingDishesCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {pendingDishesCount} {pendingDishesCount === 1 ? "dish" : "dishes"} waiting to be prepared
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {completedDishes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">No completed dishes yet.</CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {[...completedDishes].reverse().map((dish, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">
                        Dish <span className="font-bold">{dish.dishName}</span> from Order{" "}
                        <span className="font-bold">#{dish.orderId}</span> is ready.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Completed at {dish.completedAt.toLocaleTimeString()} by {dish.chefName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
