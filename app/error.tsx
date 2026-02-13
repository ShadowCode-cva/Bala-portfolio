'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * GLOBAL ERROR BOUNDARY — STABILITY NOTES
 * ───────────────────────────────────────
 * This component catches any uncaught errors in the component tree.
 * - Prevents the entire site from going blank (White Screen of Death)
 * - Logs the error for debugging
 * - Provides the user with clear, friendly recovery options
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service if needed
        console.error('CRITICAL APP ERROR:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full glass-card p-8 rounded-2xl border-primary/20 shadow-2xl text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Something went wrong</h2>
                    <p className="text-muted-foreground text-sm">
                        We encountered an unexpected error. Don't worry, your data is safe.
                        You can try refreshing the page or going back home.
                    </p>
                </div>

                {/* Error Details (Friendly) */}
                <div className="bg-muted/30 rounded-lg p-3 text-left overflow-hidden">
                    <p className="text-xs font-mono text-muted-foreground break-all">
                        Error ID: {error.digest || 'unknown'}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Refreshing
                    </Button>

                    <Button
                        variant="outline"
                        asChild
                        className="w-full border-primary/20 hover:bg-primary/5"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Link>
                    </Button>
                </div>

                <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-4">
                    Backend Stability Engine Active
                </p>
            </div>
        </div>
    )
}
