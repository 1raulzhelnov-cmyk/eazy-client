import React from 'react'

type Props = {
  title: string
  description?: string
  confirmText?: string
  onConfirm: () => void
  children: React.ReactNode
}

export default function ConfirmDialog({ title, description, confirmText = 'Подтвердить', onConfirm, children }: Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center">
          <div className="bg-white rounded-md p-4 w-[380px] shadow">
            <div className="font-semibold mb-1">{title}</div>
            {description && <div className="text-sm text-muted-foreground mb-4">{description}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1.5 text-sm rounded border" onClick={() => setOpen(false)}>Отмена</button>
              <button
                className="px-3 py-1.5 text-sm rounded bg-black text-white"
                onClick={() => {
                  onConfirm()
                  setOpen(false)
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
