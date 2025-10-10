import React from 'react'
export default function FinancePage(){
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Финансы</h1>
      <div className="rounded border p-4">Выплаты, комиссии, отчёты — TODO</div>
      <ul className="list-disc pl-6 text-sm text-muted-foreground">
        <li>Список выплат и статусы</li>
        <li>Экспорт отчётов</li>
      </ul>
    </div>
  )
}
