"use client"

import { ReactNode } from "react"

type IllustrationType =
    | "subscriptions"
    | "utility-bills"
    | "budgets"
    | "upcoming"
    | "billing-history"
    | "bill-calendar"
    | "dashboard"

interface EmptyStateProps {
    illustration: IllustrationType
    title: string
    description: string
    action?: ReactNode
    className?: string
}

function SubscriptionsIllustration() {
    return (
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stacked cards */}
            <rect x="30" y="50" width="120" height="70" rx="16" fill="#1a2236" stroke="#00D4AA" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
            <rect x="38" y="42" width="120" height="70" rx="16" fill="#1a2236" stroke="#00D4AA" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
            <rect x="46" y="34" width="120" height="70" rx="16" fill="#171B27" stroke="#00D4AA" strokeWidth="1.5" />
            {/* Card content lines */}
            <rect x="60" y="50" width="40" height="6" rx="3" fill="#00D4AA" opacity="0.5" />
            <rect x="60" y="62" width="80" height="4" rx="2" fill="#7A8BA8" opacity="0.3" />
            <rect x="60" y="72" width="55" height="4" rx="2" fill="#7A8BA8" opacity="0.2" />
            {/* Plus circle */}
            <circle cx="145" cy="30" r="18" fill="#00D4AA" opacity="0.12" />
            <circle cx="145" cy="30" r="12" fill="#00D4AA" opacity="0.2" />
            <line x1="145" y1="24" x2="145" y2="36" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" />
            <line x1="139" y1="30" x2="151" y2="30" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" />
            {/* Decorative dots */}
            <circle cx="25" cy="40" r="3" fill="#00D4AA" opacity="0.15" />
            <circle cx="165" cy="95" r="4" fill="#3B82F6" opacity="0.15" />
            <circle cx="20" cy="85" r="2" fill="#3B82F6" opacity="0.1" />
        </svg>
    )
}

function UtilityBillsIllustration() {
    return (
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Light bulb body */}
            <path d="M90 20 C65 20 50 40 50 60 C50 75 60 82 65 90 L65 100 L115 100 L115 90 C120 82 130 75 130 60 C130 40 115 20 90 20Z" fill="#171B27" stroke="#F59E0B" strokeWidth="1.5" />
            {/* Filament glow */}
            <path d="M80 55 Q85 70 90 55 Q95 70 100 55" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Bulb base */}
            <rect x="70" y="100" width="40" height="6" rx="3" fill="#F59E0B" opacity="0.3" />
            <rect x="73" y="108" width="34" height="5" rx="2.5" fill="#F59E0B" opacity="0.2" />
            <rect x="76" y="115" width="28" height="5" rx="2.5" fill="#F59E0B" opacity="0.15" />
            {/* Rays */}
            <line x1="90" y1="5" x2="90" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            <line x1="55" y1="15" x2="60" y2="21" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
            <line x1="125" y1="15" x2="120" y2="21" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
            <line x1="38" y1="40" x2="44" y2="42" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
            <line x1="142" y1="40" x2="136" y2="42" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
            {/* Meter/gauge icon */}
            <circle cx="155" cy="105" r="14" fill="#F59E0B" opacity="0.08" />
            <path d="M148 110 L155 98 L160 108" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        </svg>
    )
}

function BudgetsIllustration() {
    return (
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pie chart */}
            <circle cx="80" cy="70" r="42" fill="#171B27" stroke="#00D4AA" strokeWidth="1.5" opacity="0.3" />
            <path d="M80 28 A42 42 0 0 1 122 70 L80 70 Z" fill="#00D4AA" opacity="0.25" />
            <path d="M122 70 A42 42 0 0 1 80 112 L80 70 Z" fill="#3B82F6" opacity="0.2" />
            <path d="M80 112 A42 42 0 0 1 38 70 L80 70 Z" fill="#A78BFA" opacity="0.15" />
            <path d="M38 70 A42 42 0 0 1 80 28 L80 70 Z" fill="#F59E0B" opacity="0.15" />
            {/* Center */}
            <circle cx="80" cy="70" r="20" fill="#0D1117" />
            <text x="80" y="74" textAnchor="middle" fill="#00D4AA" fontSize="11" fontWeight="bold" fontFamily="system-ui">₹0</text>
            {/* Legend lines */}
            <rect x="135" y="40" width="24" height="4" rx="2" fill="#00D4AA" opacity="0.4" />
            <rect x="135" y="52" width="18" height="4" rx="2" fill="#3B82F6" opacity="0.3" />
            <rect x="135" y="64" width="30" height="4" rx="2" fill="#A78BFA" opacity="0.25" />
            <rect x="135" y="76" width="22" height="4" rx="2" fill="#F59E0B" opacity="0.25" />
            {/* Legend dots */}
            <circle cx="130" cy="42" r="2.5" fill="#00D4AA" opacity="0.5" />
            <circle cx="130" cy="54" r="2.5" fill="#3B82F6" opacity="0.4" />
            <circle cx="130" cy="66" r="2.5" fill="#A78BFA" opacity="0.35" />
            <circle cx="130" cy="78" r="2.5" fill="#F59E0B" opacity="0.35" />
            {/* Decorative */}
            <circle cx="25" cy="30" r="3" fill="#00D4AA" opacity="0.1" />
            <circle cx="170" cy="110" r="4" fill="#A78BFA" opacity="0.1" />
        </svg>
    )
}

function UpcomingIllustration() {
    return (
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Calendar body */}
            <rect x="30" y="30" width="120" height="95" rx="16" fill="#171B27" stroke="#00D4AA" strokeWidth="1.5" />
            {/* Calendar header bar */}
            <rect x="30" y="30" width="120" height="28" rx="16" fill="#00D4AA" opacity="0.1" />
            <rect x="30" y="44" width="120" height="14" fill="#00D4AA" opacity="0.1" />
            {/* Calendar rings */}
            <rect x="60" y="24" width="4" height="14" rx="2" fill="#00D4AA" opacity="0.4" />
            <rect x="116" y="24" width="4" height="14" rx="2" fill="#00D4AA" opacity="0.4" />
            {/* Day grid */}
            <circle cx="52" cy="78" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="72" cy="78" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="92" cy="78" r="4" fill="#00D4AA" opacity="0.25" />
            <circle cx="112" cy="78" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="132" cy="78" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="52" cy="96" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="72" cy="96" r="4" fill="#3B82F6" opacity="0.2" />
            <circle cx="92" cy="96" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="112" cy="96" r="4" fill="#F59E0B" opacity="0.2" />
            <circle cx="132" cy="96" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="52" cy="114" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="72" cy="114" r="4" fill="#7A8BA8" opacity="0.1" />
            <circle cx="92" cy="114" r="4" fill="#7A8BA8" opacity="0.1" />
            {/* Bell notification */}
            <circle cx="152" cy="22" r="14" fill="#00D4AA" opacity="0.1" />
            <path d="M148 22 C148 18 150 15 152 15 C154 15 156 18 156 22 L157 25 L147 25 L148 22Z" stroke="#00D4AA" strokeWidth="1.2" fill="none" opacity="0.5" />
            <circle cx="152" cy="27" r="1.5" fill="#00D4AA" opacity="0.4" />
        </svg>
    )
}

function BillingHistoryIllustration() {
    return (
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Receipt body */}
            <path d="M50 20 L130 20 L130 115 L125 110 L120 115 L115 110 L110 115 L105 110 L100 115 L95 110 L90 115 L85 110 L80 115 L75 110 L70 115 L65 110 L60 115 L55 110 L50 115 Z" fill="#171B27" stroke="#00D4AA" strokeWidth="1.5" />
            {/* Receipt lines */}
            <rect x="62" y="36" width="56" height="5" rx="2.5" fill="#00D4AA" opacity="0.3" />
            <rect x="62" y="50" width="40" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="108" y="50" width="14" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="62" y="60" width="35" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="108" y="60" width="14" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="62" y="70" width="45" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="108" y="70" width="14" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            {/* Divider */}
            <line x1="62" y1="82" x2="118" y2="82" stroke="#7A8BA8" strokeWidth="1" strokeDasharray="4 3" opacity="0.2" />
            {/* Total */}
            <rect x="62" y="90" width="28" height="4" rx="2" fill="#00D4AA" opacity="0.4" />
            <rect x="100" y="90" width="20" height="4" rx="2" fill="#00D4AA" opacity="0.4" />
            {/* Check badge */}
            <circle cx="148" cy="35" r="16" fill="#00D4AA" opacity="0.1" />
            <circle cx="148" cy="35" r="10" fill="#00D4AA" opacity="0.15" />
            <path d="M143 35 L146 38 L153 31" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            {/* Decorative */}
            <circle cx="35" cy="45" r="3" fill="#3B82F6" opacity="0.1" />
            <circle cx="160" cy="100" r="3" fill="#00D4AA" opacity="0.1" />
        </svg>
    )
}

function BillCalendarIllustration() {
    return (
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Calendar grid */}
            <rect x="25" y="25" width="130" height="100" rx="16" fill="#171B27" stroke="#00D4AA" strokeWidth="1.5" />
            {/* Header */}
            <rect x="25" y="25" width="130" height="24" rx="16" fill="#00D4AA" opacity="0.08" />
            <rect x="25" y="38" width="130" height="11" fill="#00D4AA" opacity="0.08" />
            {/* Grid lines */}
            <line x1="25" y1="49" x2="155" y2="49" stroke="#7A8BA8" strokeWidth="0.5" opacity="0.1" />
            {/* Day cells with colored dots */}
            <rect x="35" y="55" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="57" y="55" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="79" y="55" width="16" height="14" rx="4" fill="#00D4AA" opacity="0.1" />
            <circle cx="87" cy="66" r="2" fill="#00D4AA" opacity="0.6" />
            <rect x="101" y="55" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="123" y="55" width="16" height="14" rx="4" fill="#F59E0B" opacity="0.1" />
            <circle cx="131" cy="66" r="2" fill="#F59E0B" opacity="0.6" />
            {/* Row 2 */}
            <rect x="35" y="75" width="16" height="14" rx="4" fill="#3B82F6" opacity="0.1" />
            <circle cx="43" cy="86" r="2" fill="#3B82F6" opacity="0.6" />
            <rect x="57" y="75" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="79" y="75" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="101" y="75" width="16" height="14" rx="4" fill="#00D4AA" opacity="0.1" />
            <circle cx="109" cy="86" r="2" fill="#00D4AA" opacity="0.6" />
            <circle cx="113" cy="86" r="2" fill="#3B82F6" opacity="0.6" />
            <rect x="123" y="75" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            {/* Row 3 */}
            <rect x="35" y="95" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="57" y="95" width="16" height="14" rx="4" fill="#ef4444" opacity="0.1" />
            <circle cx="65" cy="106" r="2" fill="#ef4444" opacity="0.6" />
            <rect x="79" y="95" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="101" y="95" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
            <rect x="123" y="95" width="16" height="14" rx="4" fill="#7A8BA8" opacity="0.05" />
        </svg>
    )
}

function DashboardIllustration() {
    return (
        <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chart area */}
            <rect x="20" y="25" width="100" height="75" rx="14" fill="#171B27" stroke="#00D4AA" strokeWidth="1" opacity="0.6" />
            {/* Bar chart bars */}
            <rect x="34" y="62" width="10" height="28" rx="3" fill="#00D4AA" opacity="0.25" />
            <rect x="50" y="48" width="10" height="42" rx="3" fill="#00D4AA" opacity="0.35" />
            <rect x="66" y="55" width="10" height="35" rx="3" fill="#3B82F6" opacity="0.25" />
            <rect x="82" y="40" width="10" height="50" rx="3" fill="#00D4AA" opacity="0.4" />
            <rect x="98" y="52" width="10" height="38" rx="3" fill="#A78BFA" opacity="0.25" />
            {/* Stat cards */}
            <rect x="130" y="25" width="55" height="22" rx="8" fill="#171B27" stroke="#00D4AA" strokeWidth="1" opacity="0.5" />
            <rect x="137" y="32" width="20" height="3" rx="1.5" fill="#00D4AA" opacity="0.4" />
            <rect x="137" y="38" width="30" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="130" y="53" width="55" height="22" rx="8" fill="#171B27" stroke="#3B82F6" strokeWidth="1" opacity="0.5" />
            <rect x="137" y="60" width="20" height="3" rx="1.5" fill="#3B82F6" opacity="0.4" />
            <rect x="137" y="66" width="30" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            <rect x="130" y="81" width="55" height="22" rx="8" fill="#171B27" stroke="#A78BFA" strokeWidth="1" opacity="0.5" />
            <rect x="137" y="88" width="20" height="3" rx="1.5" fill="#A78BFA" opacity="0.4" />
            <rect x="137" y="94" width="30" height="3" rx="1.5" fill="#7A8BA8" opacity="0.2" />
            {/* Sparkle */}
            <circle cx="90" cy="20" r="10" fill="#00D4AA" opacity="0.08" />
            <path d="M90 14 L91 18 L95 18 L92 21 L93 25 L90 22 L87 25 L88 21 L85 18 L89 18 Z" fill="#00D4AA" opacity="0.3" />
            {/* Decorative */}
            <circle cx="15" cy="70" r="3" fill="#00D4AA" opacity="0.1" />
            <circle cx="195" cy="110" r="4" fill="#3B82F6" opacity="0.1" />
        </svg>
    )
}

const illustrations: Record<IllustrationType, () => JSX.Element> = {
    subscriptions: SubscriptionsIllustration,
    "utility-bills": UtilityBillsIllustration,
    budgets: BudgetsIllustration,
    upcoming: UpcomingIllustration,
    "billing-history": BillingHistoryIllustration,
    "bill-calendar": BillCalendarIllustration,
    dashboard: DashboardIllustration,
}

export function EmptyState({ illustration, title, description, action, className = "" }: EmptyStateProps) {
    const Illustration = illustrations[illustration]

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-8 glass-card rounded-[2rem] ${className}`}>
            <div className="mb-6 opacity-90">
                <Illustration />
            </div>
            <h3 className="text-xl font-semibold font-[family-name:var(--font-plus-jakarta)] tracking-tight text-white mb-2">
                {title}
            </h3>
            <p className="text-[#7A8BA8] text-center mb-8 max-w-sm text-[15px]">
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    )
}
