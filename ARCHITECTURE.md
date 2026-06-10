# CardSense — Application Architecture

```mermaid
flowchart TD
    subgraph CLIENT["Client Layer"]
        direction TB
        subgraph APP["Next.js App (React 19)"]
            direction TB
            LAYOUT["layout.tsx\nRoot layout · Analytics · Fonts"]
            PAGE["page.tsx\nAll app state · Search · Category · Wallet"]

            subgraph COMPONENTS["Components"]
                WC["WalletCard\nCard in stack · layoutId animation"]
                CDP["CardDetailPage\nFull card view · swipe-to-close"]
                ACS["AddCardSheet\nCard picker · search filter · swipe-to-close"]
                AS["AskSheet\nVoice input overlay"]
            end

            subgraph LIB["Client Libs"]
                CARDS["lib/cards.ts\nrankCards · classifyQuery · allCards"]
                CATS["lib/categories.ts\nCategory definitions + keywords"]
                CONSTS["lib/constants.ts\nspringBouncy · CARD_ASPECT · CARD_PEEK"]
                FMT["lib/formatters.ts\nnetworkLabel · formatExpiry"]
            end

            subgraph STATIC_DATA["Bundled Static Data (build-time)"]
                JSON_CARDS["data/cards/\nchase · amex · citi · capital-one\nboa · discover · us-bank · wells-fargo · other"]
                PROMOS["data/promotions.ts\nLimited-time promo rates"]
            end
        end

        LOCALSTORAGE[("localStorage\ncb-max-cards\n— wallet card IDs\n\ncb-max-last4\n— per-card last 4 digits")]
        SPEECH["Web Speech API\n(browser-native)\nSpeechRecognition"]

        PAGE --> COMPONENTS
        PAGE --> LIB
        LIB --> STATIC_DATA
        PAGE <-->|"read/write on mount + change"| LOCALSTORAGE
        AS -->|"mic input"| SPEECH
        SPEECH -->|"transcript"| AS
    end

    subgraph SERVER["Server Layer (Vercel Edge / Node)"]
        direction TB
        API_CARDS["GET /api/cards\n?id=&issuer=\nFetch card catalog"]
        API_SYNC["POST /api/sync-card-images\nSync images: RewardsCC → Blob → KV\nProtected by SYNC_CARD_IMAGES_TOKEN"]
        CARDS_STORE["lib/cards-store.ts\ngetAllCards · getCardById\ngetCardsByIssuer · seedCards\nupdateCardImage"]

        API_CARDS --> CARDS_STORE
        API_SYNC --> CARDS_STORE
    end

    subgraph EXTERNAL["External Services"]
        direction TB
        VERCEL["Vercel\nHosting · CI/CD · Cron triggers"]
        VA["Vercel Analytics\nPage view tracking"]
        KV[("Upstash Redis (Vercel KV)\nkeys:\n  cards:all\n  card:{id}\n  cards:issuer:{name}\n  issuers:list\n  cards:metadata")]
        BLOB[("Vercel Blob\nCDN image storage\ncards/api/{id}.jpg")]
        REWARDS_API["rewardscc.com\nCredit card image source API"]
        GFONTS["Google Fonts\nGeist Sans · Geist Mono"]
    end

    subgraph MOBILE["Mobile (Capacitor)"]
        IOS["iOS App\n@capacitor/ios"]
        ANDROID["Android App\n@capacitor/android"]
    end

    %% Server ↔ External
    CARDS_STORE <-->|"REST (Upstash SDK)"| KV
    API_SYNC -->|"fetch image"| REWARDS_API
    API_SYNC -->|"put (Vercel Blob SDK)"| BLOB
    VERCEL -->|"deploys"| SERVER
    VERCEL -->|"triggers cron"| API_SYNC

    %% Client ↔ Server (currently unused in prod — cards are bundled)
    CLIENT -.->|"optional: GET /api/cards"| SERVER

    %% Client ↔ External
    LAYOUT -->|"<Analytics />"| VA
    LAYOUT -->|"font load"| GFONTS
    CDP -->|"<img src>"| BLOB

    %% Mobile wraps the web app
    CLIENT -->|"Capacitor WebView"| IOS
    CLIENT -->|"Capacitor WebView"| ANDROID

    style CLIENT fill:#0d0d0d,stroke:#333,color:#fff
    style SERVER fill:#0a1628,stroke:#1e40af,color:#fff
    style EXTERNAL fill:#0d1a0d,stroke:#166534,color:#fff
    style MOBILE fill:#1a0d1a,stroke:#6b21a8,color:#fff
    style APP fill:#141414,stroke:#444,color:#fff
    style COMPONENTS fill:#1a1a1a,stroke:#555,color:#fff
    style LIB fill:#1a1a1a,stroke:#555,color:#fff
    style STATIC_DATA fill:#1a1a1a,stroke:#555,color:#fff
```

---

## Data Stores

| Store | What lives there | Who writes | Who reads |
|---|---|---|---|
| **localStorage** `cb-max-cards` | User's wallet — array of card IDs | `page.tsx` on toggle | `page.tsx` on mount |
| **localStorage** `cb-max-last4` | Last-4 digits keyed by card ID | `page.tsx` on change | `page.tsx` on mount |
| **Upstash Redis (KV)** | Full card catalog: all cards, per-id, per-issuer, issuer list, metadata | `seed-kv` script + `sync-card-images` API | `/api/cards` route |
| **Vercel Blob** | Card artwork images (CDN-served) | `sync-card-images` API | Client `<img>` tags in `CardDetailPage` / `AddCardSheet` |
| **Bundled JSON** (`src/data/cards/`) | Static card data compiled into the app bundle | Committed to git | `lib/cards.ts` at runtime (no network call) |

## Services

| Service | Role |
|---|---|
| **Vercel** | Hosting, CI/CD, cron job triggers |
| **Vercel Analytics** | Page-view and interaction telemetry |
| **Vercel KV (Upstash Redis)** | Server-side card catalog store |
| **Vercel Blob** | CDN image storage for card artwork |
| **rewardscc.com API** | Source of card artwork images (synced periodically) |
| **Google Fonts** | Geist Sans + Geist Mono typefaces |
| **Web Speech API** | Browser-native mic input for voice search |
| **Capacitor** | Wraps the web app for iOS / Android distribution |

## Key Data Flows

1. **App boot** → reads `localStorage` to restore wallet → renders card stack from bundled JSON
2. **Voice search** → Web Speech API → transcript → `classifyQuery()` → re-ranks wallet cards
3. **Add card** → toggles ID in `myCardIds` → persisted to `localStorage`
4. **Image sync (cron/manual)** → `POST /api/sync-card-images` → rewardscc.com → Vercel Blob → Upstash KV
5. **Card catalog API** → `GET /api/cards` → Upstash KV → JSON response *(currently the client uses bundled data, not this endpoint)*
```
