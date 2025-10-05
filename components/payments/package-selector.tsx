import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCredits } from "@/lib/utils"

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  discount?: number
  isPopular?: boolean
}

interface PackageSelectorProps {
  packages: CreditPackage[]
  onSelect: (pkg: CreditPackage) => void
  selectedPackageId?: string
}

export function PackageSelector({
  packages,
  onSelect,
  selectedPackageId,
}: PackageSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {packages.map((pkg) => {
        const isSelected = pkg.id === selectedPackageId
        const discountedPrice = pkg.discount
          ? pkg.price * (1 - pkg.discount / 100)
          : pkg.price

        return (
          <Card
            key={pkg.id}
            className={`relative cursor-pointer p-6 transition-all hover:shadow-aura-md ${
              isSelected ? "border-primary ring-2 ring-primary" : ""
            }`}
            onClick={() => onSelect(pkg)}
          >
            {pkg.isPopular && (
              <Badge
                className="absolute -top-2 right-4"
                variant="secondary"
              >
                Most Popular
              </Badge>
            )}

            <div className="text-2xl font-bold">{pkg.name}</div>
            
            <div className="mt-4 text-3xl font-bold">
              ${(discountedPrice / 100).toFixed(2)}
              {pkg.discount && (
                <span className="ml-2 text-base font-normal line-through text-muted-foreground">
                  ${(pkg.price / 100).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-2 text-lg text-muted-foreground">
              {formatCredits(pkg.credits)} credits
            </div>

            {pkg.discount && (
              <Badge variant="destructive" className="mt-2">
                Save {pkg.discount}%
              </Badge>
            )}

            <Button
              className="mt-4 w-full"
              variant={isSelected ? "default" : "outline"}
            >
              {isSelected ? "Selected" : "Select Package"}
            </Button>
          </Card>
        )
      })}
    </div>
  )
}
