"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Bell, Globe, LogOut, KeyRound, Loader2, Trash2, AlertTriangle, HelpCircle, Settings } from "lucide-react"
import { useCurrent } from "@/features/auth/api/use-current"
import { useLogout } from "@/features/auth/api/use-logout"
import { useUpdateProfile } from "@/features/auth/api/use-update-profile"
import { useUpdateSettings } from "@/features/auth/api/use-update-settings"
import { useChangePassword } from "@/features/auth/api/use-change-password"
import { useDeleteAccount } from "@/features/auth/api/use-delete-account"
import { updateProfileSchema, changePasswordSchema } from "@/features/auth/schemas"

type ProfileFormValues = z.infer<typeof updateProfileSchema>
type PasswordFormValues = z.infer<typeof changePasswordSchema>

export function SettingsContent() {
    const { data: user, isLoading } = useCurrent()
    const logoutMutation = useLogout()
    const updateProfileMutation = useUpdateProfile()
    const updateSettingsMutation = useUpdateSettings()
    const changePasswordMutation = useChangePassword()
    const deleteAccountMutation = useDeleteAccount()

    const [currency, setCurrency] = useState<string>("")
    const [timezone, setTimezone] = useState<string>("")
    const [emailNotifications, setEmailNotifications] = useState<boolean | null>(null)
    const [pushNotifications, setPushNotifications] = useState<boolean | null>(null)
    const [reminderDays, setReminderDays] = useState<string>("")

    // Derive display values from user data, with local overrides while saving
    const currentCurrency = currency || user?.currencyCode || "INR"
    const currentTimezone = timezone || user?.timezone || "Asia/Kolkata"
    const currentEmailNotifications = emailNotifications ?? user?.emailNotifications ?? true
    const currentPushNotifications = pushNotifications ?? user?.pushNotifications ?? true
    const currentReminderDays = reminderDays || "3"

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        values: {
            name: user?.name || "",
            phone: user?.phone || "",
        },
    })

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const handleProfileSubmit = (values: ProfileFormValues) => {
        updateProfileMutation.mutate({ json: values })
    }

    const handleRegionalSave = () => {
        updateSettingsMutation.mutate({
            json: {
                currencyCode: currentCurrency,
                timezone: currentTimezone,
            },
        })
    }

    const handleNotificationsSave = () => {
        updateSettingsMutation.mutate({
            json: {
                emailNotifications: currentEmailNotifications,
                pushNotifications: currentPushNotifications,
                reminderDaysBefore: parseInt(currentReminderDays),
            },
        })
    }

    const handlePasswordSubmit = (values: PasswordFormValues) => {
        changePasswordMutation.mutate(
            {
                json: {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                },
            },
            {
                onSuccess: () => {
                    passwordForm.reset()
                },
            }
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="h-full bg-transparent p-4 md:p-8 lg:p-12 overflow-auto">
            <div className="max-w-5xl mx-auto w-full">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold font-[family-name:var(--font-plus-jakarta)] tracking-tight mb-2">
                        Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account preferences and security settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Primary Sections */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Profile Section */}
                        <section className="bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-[#00D4AA]" />
                                </div>
                                <h2 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)]">Profile Details</h2>
                            </div>
                            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Full Name
                                        </label>
                                        <Input
                                            id="name"
                                            {...profileForm.register("name")}
                                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto"
                                        />
                                        {profileForm.formState.errors.name && (
                                            <p className="text-sm text-[#EF4444]">{profileForm.formState.errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Email Address
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={user.email}
                                            disabled
                                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Phone
                                        </label>
                                        <Input
                                            id="phone"
                                            {...profileForm.register("phone")}
                                            placeholder="Optional"
                                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="px-8 py-3 bg-[#00D4AA] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(70,241,197,0.2)] transition-all duration-300 disabled:opacity-50"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                            </span>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Preferences Section */}
                        <section className="bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-[#3B82F6]" />
                                </div>
                                <h2 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)]">Preferences</h2>
                            </div>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Primary Currency
                                        </label>
                                        <Select value={currentCurrency} onValueChange={setCurrency}>
                                            <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Timezone
                                        </label>
                                        <Select value={currentTimezone} onValueChange={setTimezone}>
                                            <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Reminder Days */}
                                <div className="space-y-2 max-w-xs">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Reminder Days Before
                                    </label>
                                    <Select value={currentReminderDays} onValueChange={setReminderDays}>
                                        <SelectTrigger className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 day before</SelectItem>
                                            <SelectItem value="3">3 days before</SelectItem>
                                            <SelectItem value="7">7 days before</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Email Notifications Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Bell className="h-5 w-5 text-[#00D4AA]" />
                                        <div>
                                            <p className="text-sm font-bold">Email Notifications</p>
                                            <p className="text-xs text-muted-foreground">Receive weekly summaries and payment alerts</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={currentEmailNotifications}
                                        onCheckedChange={setEmailNotifications}
                                    />
                                </div>

                                {/* Push Notifications Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Bell className="h-5 w-5 text-[#00D4AA]" />
                                        <div>
                                            <p className="text-sm font-bold">Push Notifications</p>
                                            <p className="text-xs text-muted-foreground">Receive push notifications for upcoming bills</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={currentPushNotifications}
                                        onCheckedChange={setPushNotifications}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            handleRegionalSave()
                                            handleNotificationsSave()
                                        }}
                                        disabled={updateSettingsMutation.isPending}
                                        className="px-8 py-3 bg-[#00D4AA] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(70,241,197,0.2)] transition-all duration-300 disabled:opacity-50"
                                    >
                                        {updateSettingsMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                            </span>
                                        ) : (
                                            "Save Preferences"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                                    <KeyRound className="h-5 w-5 text-[#8B5CF6]" />
                                </div>
                                <h2 className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)]">Security</h2>
                            </div>
                            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                                <div className="grid grid-cols-1 gap-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Current Password
                                        </label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            {...passwordForm.register("currentPassword")}
                                            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto"
                                        />
                                        {passwordForm.formState.errors.currentPassword && (
                                            <p className="text-sm text-[#EF4444]">
                                                {passwordForm.formState.errors.currentPassword.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                New Password
                                            </label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                {...passwordForm.register("newPassword")}
                                                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto"
                                            />
                                            {passwordForm.formState.errors.newPassword && (
                                                <p className="text-sm text-[#EF4444]">
                                                    {passwordForm.formState.errors.newPassword.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Confirm New Password
                                            </label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                {...passwordForm.register("confirmPassword")}
                                                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 h-auto"
                                            />
                                            {passwordForm.formState.errors.confirmPassword && (
                                                <p className="text-sm text-[#EF4444]">
                                                    {passwordForm.formState.errors.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={changePasswordMutation.isPending}
                                            className="px-6 py-3 border border-white/[0.12] text-white font-bold rounded-xl hover:bg-white/[0.06] transition-colors disabled:opacity-50"
                                        >
                                            {changePasswordMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Changing...
                                                </span>
                                            ) : (
                                                "Update Password"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Account Management */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Session Management Card */}
                        <div className="bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-6">
                                <LogOut className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] mb-2">Session Management</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Signed in as {user.email}
                            </p>
                            <button
                                onClick={() => logoutMutation.mutate()}
                                disabled={logoutMutation.isPending}
                                className="w-full py-3 border border-white/[0.12] text-white font-bold rounded-xl hover:bg-white/[0.06] transition-colors disabled:opacity-50"
                            >
                                {logoutMutation.isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Signing Out...
                                    </span>
                                ) : (
                                    "Sign Out"
                                )}
                            </button>
                        </div>

                        {/* Danger Zone Card */}
                        <div className="rounded-2xl p-8 border border-[#EF4444]/20 bg-gradient-to-br from-[#EF4444]/5 to-transparent relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-[#EF4444] mb-4">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h3 className="font-bold font-[family-name:var(--font-plus-jakarta)] uppercase tracking-wider text-xs">Danger Zone</h3>
                                </div>
                                <h3 className="text-lg font-bold font-[family-name:var(--font-plus-jakarta)] mb-2">Delete Account</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Once deleted, all your data, subscription history, and preferences will be permanently removed. This action cannot be undone.
                                </p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="w-full py-3 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 font-bold rounded-xl hover:bg-[#EF4444]/20 transition-all disabled:opacity-50">
                                            Delete Account
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your account,
                                                all your subscriptions, billing history, and notification preferences.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteAccountMutation.mutate()}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {deleteAccountMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Delete Account"
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            {/* Subtle red background glow */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#EF4444]/10 blur-[40px] rounded-full"></div>
                        </div>

                        {/* Help & Support Card */}
                        <div className="bg-[rgba(27,31,43,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-3 bg-[#00D4AA]/10 rounded-lg">
                                <HelpCircle className="h-5 w-5 text-[#00D4AA]" />
                            </div>
                            <div>
                                <h4 className="font-bold font-[family-name:var(--font-plus-jakarta)] text-sm mb-1">Need help?</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Check our documentation or contact support for billing inquiries.
                                </p>
                                <a
                                    href="#"
                                    className="inline-block mt-3 text-xs font-bold text-[#00D4AA] underline decoration-[#00D4AA]/30 underline-offset-4 hover:decoration-[#00D4AA] transition-all"
                                >
                                    Visit Help Center
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
