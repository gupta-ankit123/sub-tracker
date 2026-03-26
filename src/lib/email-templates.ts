export function passwordResetEmailHtml(params: {
    userName: string
    otp: string
}): string {
    const { userName, otp } = params

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
    <div style="background: linear-gradient(135deg, #00d4aa 0%, #46f1c5 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #005643; margin: 0; font-size: 24px;">Password Reset</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi ${userName},</p>
        <p style="font-size: 16px;">We received a request to reset your password. Use the code below to set a new password:</p>
        <div style="background: #f0fdf9; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; border: 1px solid #d1fae5;">
            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #005643;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This code expires in <strong>15 minutes</strong>.</p>
        <p style="font-size: 14px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">SubTracker &middot; Subscription Management</p>
    </div>
</body>
</html>`
}

export function billReminderEmailHtml(params: {
    userName: string
    subscriptionName: string
    amount: string
    dueDate: string
    daysUntilDue: number
}): string {
    const { userName, subscriptionName, amount, dueDate, daysUntilDue } = params

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Upcoming Bill Reminder</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi ${userName},</p>
        <p style="font-size: 16px;">Your subscription payment is coming up soon:</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subscription</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${subscriptionName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${amount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${dueDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Days Until Due</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}</td>
                </tr>
            </table>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Make sure you have sufficient funds to avoid any payment issues.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">You received this email because you have email notifications enabled. You can manage your notification preferences in Settings.</p>
    </div>
</body>
</html>`
}

export function overdueAlertEmailHtml(params: {
    userName: string
    subscriptionName: string
    amount: string
    dueDate: string
    daysOverdue: number
}): string {
    const { userName, subscriptionName, amount, dueDate, daysOverdue } = params

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Overdue Payment Alert</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Hi ${userName},</p>
        <p style="font-size: 16px;">You have an overdue subscription payment:</p>
        <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subscription</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${subscriptionName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${amount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${dueDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Days Overdue</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #ef4444; font-size: 14px;">${daysOverdue} day${daysOverdue === 1 ? "" : "s"}</td>
                </tr>
            </table>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Please make this payment as soon as possible to avoid service interruption.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">You received this email because you have email notifications enabled. You can manage your notification preferences in Settings.</p>
    </div>
</body>
</html>`
}
