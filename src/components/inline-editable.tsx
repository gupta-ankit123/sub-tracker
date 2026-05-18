"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Check, X, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

interface InlineEditableProps {
    value: string
    onSave: (value: string) => void
    isPending?: boolean
    type?: "text" | "number" | "date"
    className?: string
    inputClassName?: string
    renderValue?: (value: string) => React.ReactNode
    validate?: (value: string) => boolean
    min?: string | number
    step?: string
}

export function InlineEditable({
    value,
    onSave,
    isPending,
    type = "text",
    className,
    inputClassName,
    renderValue,
    validate,
    min,
    step,
}: InlineEditableProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    // Sync external value changes
    useEffect(() => {
        if (!isEditing) setEditValue(value)
    }, [value, isEditing])

    const handleSave = useCallback(() => {
        const trimmed = editValue.trim()
        if (trimmed === "" || trimmed === value) {
            setIsEditing(false)
            setEditValue(value)
            return
        }
        if (validate && !validate(trimmed)) {
            setEditValue(value)
            setIsEditing(false)
            return
        }
        onSave(trimmed)
        setIsEditing(false)
    }, [editValue, value, onSave, validate])

    const handleCancel = useCallback(() => {
        setEditValue(value)
        setIsEditing(false)
    }, [value])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleSave()
        } else if (e.key === "Escape") {
            handleCancel()
        }
    }, [handleSave, handleCancel])

    if (isEditing) {
        return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    min={min}
                    step={step}
                    disabled={isPending}
                    className={cn(
                        "bg-white/[0.08] border border-[#00D4AA]/40 rounded-lg px-2.5 py-1 text-white outline-none focus:ring-1 focus:ring-[#00D4AA]/60 transition-all",
                        type === "number" && "w-28",
                        type === "date" && "w-40",
                        type === "text" && "w-full max-w-[180px]",
                        inputClassName
                    )}
                />
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleSave() }}
                    className="p-1 rounded-md bg-[#00D4AA]/20 text-[#00D4AA] hover:bg-[#00D4AA]/30 transition-colors"
                >
                    <Check className="h-3.5 w-3.5" />
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleCancel() }}
                    className="p-1 rounded-md bg-white/[0.06] text-[#7A8BA8] hover:bg-white/[0.1] transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        )
    }

    return (
        <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
            onKeyDown={(e) => { if (e.key === "Enter") setIsEditing(true) }}
            className={cn(
                "group/edit inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-1 -mx-1 transition-all hover:bg-white/[0.06]",
                className
            )}
            title="Click to edit"
        >
            {renderValue ? renderValue(value) : <span>{value}</span>}
            <Pencil className="h-3 w-3 text-[#7A8BA8] opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0" />
        </span>
    )
}
