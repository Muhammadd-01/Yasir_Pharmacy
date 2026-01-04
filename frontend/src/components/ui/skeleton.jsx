import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted skeleton",
                className
            )}
            {...props}
        />
    )
}

// Product Card Skeleton
function ProductCardSkeleton() {
    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

// Category Card Skeleton
function CategoryCardSkeleton() {
    return (
        <div className="glass-card rounded-xl p-6 space-y-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    )
}

// Text Line Skeleton
function TextSkeleton({ lines = 3 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-4"
                    style={{ width: `${100 - (i * 15)}%` }}
                />
            ))}
        </div>
    )
}

export { Skeleton, ProductCardSkeleton, CategoryCardSkeleton, TextSkeleton }
