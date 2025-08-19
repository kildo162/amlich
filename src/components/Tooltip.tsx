import React, { useId, useState, cloneElement, isValidElement } from 'react'

type TooltipProps = {
  content: React.ReactNode
  id?: string
  panelClassName?: string
  children: React.ReactElement
}

export default function Tooltip({ content, id, panelClassName, children }: TooltipProps) {
  const autoId = useId()
  const tooltipId = id || `tooltip-${autoId}`
  const [open, setOpen] = useState(false)

  if (!isValidElement(children)) return children as any

  const child = children as React.ReactElement<any>
  const mergedProps: any = {
    tabIndex: child.props.tabIndex ?? 0,
    'aria-describedby': open ? tooltipId : undefined,
    onMouseEnter: (e: any) => { child.props.onMouseEnter?.(e); setOpen(true) },
    onMouseLeave: (e: any) => { child.props.onMouseLeave?.(e); setOpen(false) },
    onFocus: (e: any) => { child.props.onFocus?.(e); setOpen(true) },
    onBlur: (e: any) => { child.props.onBlur?.(e); setOpen(false) },
  }

  return (
    <span className="relative inline-block">
      {cloneElement(child, mergedProps)}
      {open && (
        <div id={tooltipId} role="tooltip" className={`absolute z-20 left-0 mt-1 card p-2 text-xs ${panelClassName || ''}`}>
          {content}
        </div>
      )}
    </span>
  )
}
