"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Chef } from "@/lib/types"
import { ChefHat, Trash2, PlusCircle } from "lucide-react"

interface ChefManagementProps {
  chefs: Chef[]
  onAddChef: (name: string) => void
  onRemoveChef: (id: number) => void
}

export function ChefManagement({ chefs, onAddChef, onRemoveChef }: ChefManagementProps) {
  const [newChefName, setNewChefName] = useState("")

  const handleAddChef = (e: React.FormEvent) => {
    e.preventDefault()
    if (newChefName.trim()) {
      onAddChef(newChefName.trim())
      setNewChefName("")
    }
  }

  // Count pending dishes across all orders
  const busyChefs = chefs.filter((chef) => chef.status === "busy").length
  const availableChefs = chefs.filter((chef) => chef.status === "available").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Chef</CardTitle>
          <CardDescription>Add more chefs to increase kitchen capacity</CardDescription>
        </CardHeader>
        <form onSubmit={handleAddChef}>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Chef name"
                value={newChefName}
                onChange={(e) => setNewChefName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newChefName.trim()} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Chef
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            New chefs will be immediately available to prepare pending dishes.
          </p>
        </CardFooter>
      </Card>

      {busyChefs > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              {busyChefs} of {chefs.length} chefs are currently busy preparing dishes.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {availableChefs > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              {availableChefs} {availableChefs === 1 ? "chef is" : "chefs are"} available to prepare dishes.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Chefs</CardTitle>
          <CardDescription>Manage your kitchen staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chefs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No chefs available. Add a chef to get started.</p>
            ) : (
              chefs.map((chef) => (
                <div
                  key={chef.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    chef.status === "available" ? "border-green-200 bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ChefHat
                      className={`h-5 w-5 ${chef.status === "available" ? "text-green-500" : "text-blue-500"}`}
                    />
                    <div>
                      <p className="font-medium">{chef.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={chef.status === "available" ? "bg-green-500" : "bg-blue-500"}>
                          {chef.status.charAt(0).toUpperCase() + chef.status.slice(1)}
                        </Badge>
                        {chef.status === "busy" && chef.currentDish && (
                          <p className="text-sm text-muted-foreground">Preparing: {chef.currentDish.dishName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveChef(chef.id)}
                    disabled={chef.status === "busy"}
                    title={chef.status === "busy" ? "Cannot remove a busy chef" : "Remove chef"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Note: You cannot remove chefs who are currently preparing dishes.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
