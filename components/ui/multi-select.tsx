import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  maxSelections?: number
  placeholder?: string
  className?: string
}

export function MultiSelect({
  value,
  onChange,
  options,
  maxSelections,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = React.useCallback(
    (option: Option) => {
      setInputValue("")
      if (value.includes(option.value)) {
        onChange(value.filter((item) => item !== option.value))
      } else if (!maxSelections || value.length < maxSelections) {
        onChange([...value, option.value])
      }
    },
    [maxSelections, onChange, value]
  )

  const handleRemove = React.useCallback(
    (selectedValue: string) => {
      onChange(value.filter((item) => item !== selectedValue))
    },
    [onChange, value]
  )

  return (
    <Command
      onKeyDown={(e) => {
        if (e.key === "Backspace" && !inputValue && value.length > 0) {
          handleRemove(value[value.length - 1])
        }
      }}
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue)
            if (!option) return null

            return (
              <Badge
                key={selectedValue}
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(selectedValue)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleRemove(selectedValue)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : undefined}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-aura-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {options
                .filter((option) => {
                  const matchesSearch = option.label
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                  const isSelected = value.includes(option.value)
                  return matchesSearch && (!maxSelections || value.length < maxSelections || isSelected)
                })
                .map((option) => {
                  const isSelected = value.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                    >
                      {option.label}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
}
