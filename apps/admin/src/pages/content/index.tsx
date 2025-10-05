import React from 'react'
export default function ContentPage(){
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Контент-модерация</h1>
      <div className="rounded border p-4">Проверка контента — TODO</div>
      <ul className="list-disc pl-6 text-sm text-muted-foreground">
        <li>Очередь модерации</li>
        <li>Жалобы</li>
      </ul>
    </div>
  )
}
