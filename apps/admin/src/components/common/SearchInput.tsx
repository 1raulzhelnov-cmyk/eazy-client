import React from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchInput({ value, onChange, placeholder }: Props) {
  return (
    <input
      className="h-9 px-3 border rounded-md w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Поиск…'}
    />
  )
}
