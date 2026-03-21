export interface PopularSubscription {
    name: string
    logoUrl: string
    websiteUrl: string
    defaultAmount: number
    defaultCycle: string
    color: string // brand color for the icon background
}

export const POPULAR_SUBSCRIPTIONS: Record<string, PopularSubscription[]> = {
    "OTT & Entertainment": [
        { name: "Netflix", logoUrl: "https://cdn.simpleicons.org/netflix/E50914", websiteUrl: "https://netflix.com", defaultAmount: 199, defaultCycle: "MONTHLY", color: "#E50914" },
        { name: "Amazon Prime", logoUrl: "https://cdn.simpleicons.org/amazonprime/00A8E1", websiteUrl: "https://primevideo.com", defaultAmount: 1499, defaultCycle: "ANNUAL", color: "#00A8E1" },
        { name: "Disney+ Hotstar", logoUrl: "https://cdn.simpleicons.org/hotstar/1F2B73", websiteUrl: "https://hotstar.com", defaultAmount: 299, defaultCycle: "MONTHLY", color: "#1F2B73" },
        { name: "JioCinema", logoUrl: "https://cdn.simpleicons.org/jio/0A3161", websiteUrl: "https://jiocinema.com", defaultAmount: 29, defaultCycle: "MONTHLY", color: "#0A3161" },
        { name: "Sony LIV", logoUrl: "https://cdn.simpleicons.org/sony/000000", websiteUrl: "https://sonyliv.com", defaultAmount: 299, defaultCycle: "MONTHLY", color: "#111111" },
        { name: "Zee5", logoUrl: "https://cdn.simpleicons.org/zee5/8230C8", websiteUrl: "https://zee5.com", defaultAmount: 299, defaultCycle: "MONTHLY", color: "#8230C8" },
        { name: "YouTube Premium", logoUrl: "https://cdn.simpleicons.org/youtube/FF0000", websiteUrl: "https://youtube.com/premium", defaultAmount: 149, defaultCycle: "MONTHLY", color: "#FF0000" },
        { name: "Apple TV+", logoUrl: "https://cdn.simpleicons.org/appletv/000000", websiteUrl: "https://tv.apple.com", defaultAmount: 99, defaultCycle: "MONTHLY", color: "#555555" },
    ],
    "Music Streaming": [
        { name: "Spotify", logoUrl: "https://cdn.simpleicons.org/spotify/1DB954", websiteUrl: "https://spotify.com", defaultAmount: 119, defaultCycle: "MONTHLY", color: "#1DB954" },
        { name: "Apple Music", logoUrl: "https://cdn.simpleicons.org/applemusic/FA233B", websiteUrl: "https://music.apple.com", defaultAmount: 99, defaultCycle: "MONTHLY", color: "#FA233B" },
        { name: "YouTube Music", logoUrl: "https://cdn.simpleicons.org/youtubemusic/FF0000", websiteUrl: "https://music.youtube.com", defaultAmount: 99, defaultCycle: "MONTHLY", color: "#FF0000" },
        { name: "JioSaavn", logoUrl: "https://cdn.simpleicons.org/jiosaavn/2BC5B4", websiteUrl: "https://jiosaavn.com", defaultAmount: 99, defaultCycle: "MONTHLY", color: "#2BC5B4" },
        { name: "Gaana", logoUrl: "https://cdn.simpleicons.org/gaana/E72C30", websiteUrl: "https://gaana.com", defaultAmount: 99, defaultCycle: "MONTHLY", color: "#E72C30" },
        { name: "Amazon Music", logoUrl: "https://cdn.simpleicons.org/amazonmusic/25D8FD", websiteUrl: "https://music.amazon.in", defaultAmount: 0, defaultCycle: "MONTHLY", color: "#25D8FD" },
    ],
    "Cloud Storage": [
        { name: "Google One", logoUrl: "https://cdn.simpleicons.org/google/4285F4", websiteUrl: "https://one.google.com", defaultAmount: 130, defaultCycle: "MONTHLY", color: "#4285F4" },
        { name: "iCloud+", logoUrl: "https://cdn.simpleicons.org/icloud/3693F3", websiteUrl: "https://icloud.com", defaultAmount: 75, defaultCycle: "MONTHLY", color: "#3693F3" },
        { name: "Dropbox", logoUrl: "https://cdn.simpleicons.org/dropbox/0061FF", websiteUrl: "https://dropbox.com", defaultAmount: 978, defaultCycle: "MONTHLY", color: "#0061FF" },
        { name: "OneDrive", logoUrl: "https://cdn.simpleicons.org/microsoftonedrive/0078D4", websiteUrl: "https://onedrive.live.com", defaultAmount: 140, defaultCycle: "MONTHLY", color: "#0078D4" },
    ],
    "Productivity": [
        { name: "Microsoft 365", logoUrl: "https://cdn.simpleicons.org/microsoft365/D83B01", websiteUrl: "https://microsoft.com/microsoft-365", defaultAmount: 489, defaultCycle: "MONTHLY", color: "#D83B01" },
        { name: "Notion", logoUrl: "https://cdn.simpleicons.org/notion/000000", websiteUrl: "https://notion.so", defaultAmount: 640, defaultCycle: "MONTHLY", color: "#000000" },
        { name: "ChatGPT Plus", logoUrl: "https://cdn.simpleicons.org/openai/412991", websiteUrl: "https://chat.openai.com", defaultAmount: 1680, defaultCycle: "MONTHLY", color: "#412991" },
        { name: "Claude Pro", logoUrl: "https://cdn.simpleicons.org/anthropic/D97757", websiteUrl: "https://claude.ai", defaultAmount: 1680, defaultCycle: "MONTHLY", color: "#D97757" },
        { name: "Canva Pro", logoUrl: "https://cdn.simpleicons.org/canva/00C4CC", websiteUrl: "https://canva.com", defaultAmount: 500, defaultCycle: "MONTHLY", color: "#00C4CC" },
        { name: "Grammarly", logoUrl: "https://cdn.simpleicons.org/grammarly/15C39A", websiteUrl: "https://grammarly.com", defaultAmount: 984, defaultCycle: "MONTHLY", color: "#15C39A" },
    ],
    "Fitness & Health": [
        { name: "cult.fit", logoUrl: "https://cdn.simpleicons.org/cultfit/EE1538", websiteUrl: "https://cult.fit", defaultAmount: 599, defaultCycle: "MONTHLY", color: "#EE1538" },
        { name: "HealthifyMe", logoUrl: "https://cdn.simpleicons.org/healthifyme/F5A623", websiteUrl: "https://healthifyme.com", defaultAmount: 299, defaultCycle: "MONTHLY", color: "#F5A623" },
        { name: "Fitbit Premium", logoUrl: "https://cdn.simpleicons.org/fitbit/00B0B9", websiteUrl: "https://fitbit.com", defaultAmount: 570, defaultCycle: "MONTHLY", color: "#00B0B9" },
        { name: "Nike Training", logoUrl: "https://cdn.simpleicons.org/nike/111111", websiteUrl: "https://nike.com", defaultAmount: 0, defaultCycle: "MONTHLY", color: "#111111" },
        { name: "Strava", logoUrl: "https://cdn.simpleicons.org/strava/FC4C02", websiteUrl: "https://strava.com", defaultAmount: 459, defaultCycle: "MONTHLY", color: "#FC4C02" },
    ],
    "News & Media": [
        { name: "The Hindu", logoUrl: "https://cdn.simpleicons.org/thehindu/002E5F", websiteUrl: "https://thehindu.com", defaultAmount: 299, defaultCycle: "MONTHLY", color: "#002E5F" },
        { name: "Times of India+", logoUrl: "https://cdn.simpleicons.org/timesofindia/FF0000", websiteUrl: "https://timesofindia.com", defaultAmount: 199, defaultCycle: "MONTHLY", color: "#FF0000" },
        { name: "Economic Times", logoUrl: "https://cdn.simpleicons.org/economictimes/004481", websiteUrl: "https://economictimes.com", defaultAmount: 199, defaultCycle: "MONTHLY", color: "#004481" },
        { name: "Medium", logoUrl: "https://cdn.simpleicons.org/medium/000000", websiteUrl: "https://medium.com", defaultAmount: 200, defaultCycle: "MONTHLY", color: "#000000" },
    ],
    "Gaming": [
        { name: "PlayStation Plus", logoUrl: "https://cdn.simpleicons.org/playstation/003791", websiteUrl: "https://playstation.com", defaultAmount: 499, defaultCycle: "MONTHLY", color: "#003791" },
        { name: "Xbox Game Pass", logoUrl: "https://cdn.simpleicons.org/xbox/107C10", websiteUrl: "https://xbox.com/gamepass", defaultAmount: 449, defaultCycle: "MONTHLY", color: "#107C10" },
        { name: "Nintendo Online", logoUrl: "https://cdn.simpleicons.org/nintendo/E60012", websiteUrl: "https://nintendo.com", defaultAmount: 159, defaultCycle: "MONTHLY", color: "#E60012" },
        { name: "Steam", logoUrl: "https://cdn.simpleicons.org/steam/000000", websiteUrl: "https://store.steampowered.com", defaultAmount: 0, defaultCycle: "MONTHLY", color: "#171A21" },
        { name: "EA Play", logoUrl: "https://cdn.simpleicons.org/ea/000000", websiteUrl: "https://ea.com/ea-play", defaultAmount: 299, defaultCycle: "MONTHLY", color: "#000000" },
    ],
    "Software & Tools": [
        { name: "GitHub Pro", logoUrl: "https://cdn.simpleicons.org/github/181717", websiteUrl: "https://github.com", defaultAmount: 340, defaultCycle: "MONTHLY", color: "#181717" },
        { name: "Adobe Creative Cloud", logoUrl: "https://cdn.simpleicons.org/adobe/FF0000", websiteUrl: "https://adobe.com", defaultAmount: 1675, defaultCycle: "MONTHLY", color: "#FF0000" },
        { name: "Figma", logoUrl: "https://cdn.simpleicons.org/figma/F24E1E", websiteUrl: "https://figma.com", defaultAmount: 1020, defaultCycle: "MONTHLY", color: "#F24E1E" },
        { name: "Vercel Pro", logoUrl: "https://cdn.simpleicons.org/vercel/000000", websiteUrl: "https://vercel.com", defaultAmount: 1680, defaultCycle: "MONTHLY", color: "#000000" },
        { name: "1Password", logoUrl: "https://cdn.simpleicons.org/1password/0094F5", websiteUrl: "https://1password.com", defaultAmount: 247, defaultCycle: "MONTHLY", color: "#0094F5" },
        { name: "NordVPN", logoUrl: "https://cdn.simpleicons.org/nordvpn/4687FF", websiteUrl: "https://nordvpn.com", defaultAmount: 349, defaultCycle: "MONTHLY", color: "#4687FF" },
    ],
    "E-learning": [
        { name: "Coursera Plus", logoUrl: "https://cdn.simpleicons.org/coursera/0056D2", websiteUrl: "https://coursera.org", defaultAmount: 3499, defaultCycle: "MONTHLY", color: "#0056D2" },
        { name: "Udemy Business", logoUrl: "https://cdn.simpleicons.org/udemy/A435F0", websiteUrl: "https://udemy.com", defaultAmount: 999, defaultCycle: "MONTHLY", color: "#A435F0" },
        { name: "Unacademy", logoUrl: "https://cdn.simpleicons.org/unacademy/08BD80", websiteUrl: "https://unacademy.com", defaultAmount: 833, defaultCycle: "MONTHLY", color: "#08BD80" },
        { name: "Skillshare", logoUrl: "https://cdn.simpleicons.org/skillshare/00FF84", websiteUrl: "https://skillshare.com", defaultAmount: 720, defaultCycle: "MONTHLY", color: "#00FF84" },
        { name: "LinkedIn Learning", logoUrl: "https://cdn.simpleicons.org/linkedin/0A66C2", websiteUrl: "https://linkedin.com/learning", defaultAmount: 1550, defaultCycle: "MONTHLY", color: "#0A66C2" },
        { name: "Brilliant", logoUrl: "https://cdn.simpleicons.org/brilliant/FB9B00", websiteUrl: "https://brilliant.org", defaultAmount: 900, defaultCycle: "MONTHLY", color: "#FB9B00" },
    ],
    "Food Delivery": [
        { name: "Zomato Gold", logoUrl: "https://cdn.simpleicons.org/zomato/E23744", websiteUrl: "https://zomato.com", defaultAmount: 150, defaultCycle: "MONTHLY", color: "#E23744" },
        { name: "Swiggy One", logoUrl: "https://cdn.simpleicons.org/swiggy/FC8019", websiteUrl: "https://swiggy.com", defaultAmount: 149, defaultCycle: "MONTHLY", color: "#FC8019" },
        { name: "Blinkit", logoUrl: "https://cdn.simpleicons.org/zomato/F7D916", websiteUrl: "https://blinkit.com", defaultAmount: 0, defaultCycle: "MONTHLY", color: "#F7D916" },
        { name: "BigBasket BBStar", logoUrl: "https://cdn.simpleicons.org/bigbasket/84C225", websiteUrl: "https://bigbasket.com", defaultAmount: 299, defaultCycle: "ANNUAL", color: "#84C225" },
    ],
}
