"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { User, Bell, Globe, LogOut, KeyRound, Loader2 } from "lucide-react"
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
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="h-full bg-neutral-500/5 p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <User className="h-5 w-5" />
                            <div>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Manage your personal information</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" {...profileForm.register("name")} />
                                    {profileForm.formState.errors.name && (
                                        <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={user.email} disabled />
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...profileForm.register("phone")} placeholder="Optional" />
                                </div>
                                <Button type="submit" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Regional Settings Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <div>
                                <CardTitle>Regional Settings</CardTitle>
                                <CardDescription>Customize your regional preferences</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Currency</Label>
                                <Select value={currentCurrency} onValueChange={setCurrency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Timezone</Label>
                                <Select value={currentTimezone} onValueChange={setTimezone}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleRegionalSave} disabled={updateSettingsMutation.isPending}>
                                {updateSettingsMutation.isPending ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    "Save Preferences"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notifications Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Manage your notification preferences</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive billing reminders via email</p>
                                </div>
                                <Switch
                                    checked={currentEmailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                                </div>
                                <Switch
                                    checked={currentPushNotifications}
                                    onCheckedChange={setPushNotifications}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Reminder Days Before</Label>
                                <Select value={currentReminderDays} onValueChange={setReminderDays}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 day before</SelectItem>
                                        <SelectItem value="3">3 days before</SelectItem>
                                        <SelectItem value="7">7 days before</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleNotificationsSave} disabled={updateSettingsMutation.isPending}>
                                {updateSettingsMutation.isPending ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                ) : (
                                    "Save Preferences"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Change Password Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            <div>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your account password</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        {...passwordForm.register("currentPassword")}
                                    />
                                    {passwordForm.formState.errors.currentPassword && (
                                        <p className="text-sm text-red-500">
                                            {passwordForm.formState.errors.currentPassword.message}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...passwordForm.register("newPassword")}
                                    />
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-sm text-red-500">
                                            {passwordForm.formState.errors.newPassword.message}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...passwordForm.register("confirmPassword")}
                                    />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-500">
                                            {passwordForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" disabled={changePasswordMutation.isPending}>
                                    {changePasswordMutation.isPending ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Changing...</>
                                    ) : (
                                        "Change Password"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            <div>
                                <CardTitle>Account</CardTitle>
                                <CardDescription>Manage your account</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div>
                                    <p className="font-medium">Sign Out</p>
                                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                >
                                    {logoutMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Sign Out"
                                    )}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                                <div>
                                    <p className="font-medium text-red-600">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete</Button>
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
