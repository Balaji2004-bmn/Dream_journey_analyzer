import * as React from "react"
import { cn } from "@/lib/utils"

const DreamCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg bg-card/80 dark:bg-card/90 backdrop-blur-md border border-border/20 shadow-lg hover:shadow-xl transition-shadow duration-300",
      className
    )}
    {...props}
  />
))
DreamCard.displayName = "DreamCard"

const DreamCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
DreamCardHeader.displayName = "DreamCardHeader"

const DreamCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
DreamCardTitle.displayName = "DreamCardTitle"

const DreamCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DreamCardDescription.displayName = "DreamCardDescription"

const DreamCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
DreamCardContent.displayName = "DreamCardContent"

const DreamCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
DreamCardFooter.displayName = "DreamCardFooter"

export { DreamCard, DreamCardHeader, DreamCardFooter, DreamCardTitle, DreamCardDescription, DreamCardContent }





