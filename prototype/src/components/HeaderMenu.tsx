import type { ComponentProps } from "react"
import { ChevronRight } from "lucide-react"
import { DropdownMenu } from "radix-ui"

import { cn } from "@/lib/utils"

const SURFACE =
  "z-50 min-w-56 overflow-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"

const ROW =
  "relative flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export function HeaderMenuContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        data-slot="header-menu-content"
        className={cn(SURFACE, className)}
        {...props}
      />
    </DropdownMenu.Portal>
  )
}

export function HeaderMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.Item>) {
  return <DropdownMenu.Item className={cn(ROW, className)} {...props} />
}

export function HeaderMenuRadioItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.RadioItem>) {
  return <DropdownMenu.RadioItem className={cn(ROW, className)} {...props} />
}

export function HeaderMenuSeparator() {
  return <DropdownMenu.Separator className="-mx-1.5 my-1.5 h-px bg-border" />
}

export function HeaderMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenu.SubTrigger>) {
  return (
    <DropdownMenu.SubTrigger className={cn(ROW, className)} {...props}>
      {children}
      <ChevronRight className="text-muted-foreground" />
    </DropdownMenu.SubTrigger>
  )
}

export function HeaderMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.SubContent>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.SubContent
        sideOffset={6}
        data-slot="header-menu-content"
        className={cn(SURFACE, "min-w-40", className)}
        {...props}
      />
    </DropdownMenu.Portal>
  )
}
