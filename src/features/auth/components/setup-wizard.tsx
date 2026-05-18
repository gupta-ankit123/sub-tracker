"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Wallet, CreditCard, Target, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IncomeStep } from "./setup-steps/income-step"
import { SubscriptionsStep } from "./setup-steps/subscriptions-step"
import { BudgetStep } from "./setup-steps/budget-step"
import { useCompleteOnboarding } from "../api/use-complete-onboarding"
import { cn } from "@/lib/utils"

const STEPS = [
    { id: 1, title: "Set Income", description: "Monthly income helps us track spending", icon: Wallet },
    { id: 2, title: "Add Subscriptions", description: "Pick services you already use", icon: CreditCard },
    { id: 3, title: "Set Budget", description: "Create your first spending budget", icon: Target },
] as const

interface SetupWizardProps {
    userName: string
}

export function SetupWizard({ userName }: SetupWizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const router = useRouter()
    const completeOnboarding = useCompleteOnboarding()

    const markStepDone = (step: number) => {
        setCompletedSteps((prev) => new Set(prev).add(step))
    }

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep((s) => s + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((s) => s - 1)
        }
    }

    const handleFinish = () => {
        completeOnboarding.mutate(undefined, {
            onSuccess: () => {
                router.push("/dashboard")
            },
        })
    }

    const handleSkipAll = () => {
        completeOnboarding.mutate(undefined, {
            onSuccess: () => {
                router.push("/dashboard")
            },
        })
    }

    return (
        <div className="min-h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#00D4AA]/10">
                        <Sparkles className="h-5 w-5 text-[#00D4AA]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome, {userName}!
                    </h1>
                </div>
                <p className="text-slate-400 ml-12">
                    Let&apos;s set up your account in 3 quick steps. You can skip any step and do it later.
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((step, index) => {
                    const isActive = currentStep === step.id
                    const isCompleted = completedSteps.has(step.id)
                    const Icon = step.icon

                    return (
                        <div key={step.id} className="flex items-center gap-2 flex-1">
                            <button
                                onClick={() => setCurrentStep(step.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full",
                                    isActive
                                        ? "border-[#00D4AA]/50 bg-[#00D4AA]/10 shadow-lg shadow-[#00D4AA]/5"
                                        : isCompleted
                                            ? "border-[#00D4AA]/30 bg-[#00D4AA]/5"
                                            : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                                        isActive
                                            ? "bg-[#00D4AA] text-black"
                                            : isCompleted
                                                ? "bg-[#00D4AA]/20 text-[#00D4AA]"
                                                : "bg-slate-700 text-slate-400"
                                    )}
                                >
                                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isActive ? "text-white" : isCompleted ? "text-[#00D4AA]" : "text-slate-400"
                                    )}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-slate-500 hidden md:block">{step.description}</p>
                                </div>
                            </button>
                            {index < STEPS.length - 1 && (
                                <div className={cn(
                                    "h-px w-4 shrink-0 hidden lg:block",
                                    completedSteps.has(step.id) ? "bg-[#00D4AA]/50" : "bg-slate-700"
                                )} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentStep === 1 && (
                            <IncomeStep
                                onComplete={() => {
                                    markStepDone(1)
                                    handleNext()
                                }}
                                onSkip={handleNext}
                            />
                        )}
                        {currentStep === 2 && (
                            <SubscriptionsStep
                                onComplete={() => {
                                    markStepDone(2)
                                    handleNext()
                                }}
                                onSkip={handleNext}
                            />
                        )}
                        {currentStep === 3 && (
                            <BudgetStep
                                onComplete={() => {
                                    markStepDone(3)
                                    handleFinish()
                                }}
                                onSkip={handleFinish}
                                isFinishing={completeOnboarding.isPending}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleSkipAll}
                    className="text-slate-500 hover:text-slate-300 text-sm"
                    disabled={completeOnboarding.isPending}
                >
                    Skip setup entirely
                </Button>

                {currentStep < 3 ? (
                    <Button
                        onClick={handleNext}
                        className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-medium"
                    >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleFinish}
                        className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-medium"
                        disabled={completeOnboarding.isPending}
                    >
                        {completeOnboarding.isPending ? "Finishing..." : "Finish Setup"}
                        {!completeOnboarding.isPending && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                )}
            </div>
        </div>
    )
}
