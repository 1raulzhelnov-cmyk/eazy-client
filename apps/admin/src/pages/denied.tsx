import React from 'react'
export default function AccessDeniedPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Доступ запрещён</h1>
      <p className="text-muted-foreground">Требуется роль admin в Firebase customClaims.</p>
    </div>
  )
}
