"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2, Check, X, Plus } from "lucide-react"

interface Todo {
  id: string
  text: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(false)

  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos])

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/todos")
      const data = await res.json()
      setTodos(data.todos ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async () => {
    const text = newTodo.trim()
    if (!text) return
    setNewTodo("")
    const optimistic: Todo = { id: `temp-${Date.now()}`, text, completed: false }
    setTodos((prev) => [optimistic, ...prev])
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data?.id) {
        await fetchTodos()
      }
    } catch (_) {
      await fetchTodos()
    }
  }

  const deleteTodo = async (id: string) => {
    setTodos((t) => t.filter((x) => x.id !== id))
    try {
      await fetch(`/api/todos?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    } finally {
      await fetchTodos()
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEdit = async () => {
    const id = editingId
    const text = editingText.trim()
    if (!id || !text) return cancelEdit()
    setEditingId(null)
    setEditingText("")
    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text }),
      })
    } finally {
      await fetchTodos()
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText("")
  }

  const toggleComplete = async (id: string) => {
    const target = todos.find((t) => t.id === id)
    if (!target) return
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !target.completed }),
      })
    } finally {
      await fetchTodos()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">My Todo List</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mt-2">Stay organized and get things done</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addTodo)}
                className="flex-1"
              />
              <Button onClick={addTodo} disabled={!newTodo.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Tasks ({todos.length})
              {todos.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {completedCount} completed
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-4">📝</div>
                <p>{loading ? "Loading..." : "No tasks yet. Add one above to get started!"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      todo.completed ? "bg-muted/50 border-muted" : "bg-background border-border hover:bg-muted/30"
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground hover:border-primary"
                      }`}
                    >
                      {todo.completed && <Check className="h-3 w-3" />}
                    </button>

                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <Input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, saveEdit)}
                          className="h-8"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {todo.text}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {editingId === todo.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={saveEdit} disabled={!editingText.trim()}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => startEditing(todo)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTodo(todo.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with React & Next.js</p>
            <p className="mt-1">Stay productive and organized! ✨</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


