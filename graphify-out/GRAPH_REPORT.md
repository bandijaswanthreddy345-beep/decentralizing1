# Graph Report - .  (2026-04-30)

## Corpus Check
- 188 files · ~144,429 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 712 nodes · 702 edges · 45 communities detected
- Extraction: 84% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Video  Focus  Modal|Video / Focus / Modal]]
- [[_COMMUNITY_Auth  Lumina  Dark|Auth / Lumina / Dark]]
- [[_COMMUNITY_ConnectWalletButton  ChainHUD  WalletBanner|ConnectWalletButton / ChainHUD / WalletBanner]]
- [[_COMMUNITY_ProtectedRoute  SpeedNetworking  AgendaItem|ProtectedRoute / SpeedNetworking / AgendaItem]]
- [[_COMMUNITY_Animation  Polygon  Motion|Animation / Polygon / Motion]]
- [[_COMMUNITY_Control  Chat  Equalizer|Control / Chat / Equalizer]]
- [[_COMMUNITY_Seed  Persistence  Participant|Seed / Persistence / Participant]]
- [[_COMMUNITY_index  BottomBar  TopBar|index / BottomBar / TopBar]]
- [[_COMMUNITY_Chain  Receipt  Registry|Chain / Receipt / Registry]]
- [[_COMMUNITY_CommandPalette  ToastSystem  useLocalStorage|CommandPalette / ToastSystem / useLocalStorage]]
- [[_COMMUNITY_Summary  Action  Items|Summary / Action / Items]]
- [[_COMMUNITY_Model  Middleware  Router|Model / Middleware / Router]]
- [[_COMMUNITY_Room  Provider  Root|Room / Provider / Root]]
- [[_COMMUNITY_Recording  Controls  ActivityLog|Recording / Controls / ActivityLog]]
- [[_COMMUNITY_Sign  Button  Input|Sign / Button / Input]]
- [[_COMMUNITY_Analytics  Rooms  Participant|Analytics / Rooms / Participant]]
- [[_COMMUNITY_Scheduler  AddItemModal  AgendaItem|Scheduler / AddItemModal / AgendaItem]]
- [[_COMMUNITY_Continue  with  Option|Continue / with / Option]]
- [[_COMMUNITY_Dashboard  Layer  Card|Dashboard / Layer / Card]]
- [[_COMMUNITY_Word  SpeedNetworking  Speed|Word / SpeedNetworking / Speed]]
- [[_COMMUNITY_Button  Continue  with|Button / Continue / with]]
- [[_COMMUNITY_AnimatedPage  CustomCursor  AnimationProvider|AnimatedPage / CustomCursor / AnimationProvider]]
- [[_COMMUNITY_apiClient  meetingApi  getApiErrorMessage|apiClient / meetingApi / getApiErrorMessage]]
- [[_COMMUNITY_Background  Aurora  Canvas|Background / Aurora / Canvas]]
- [[_COMMUNITY_Contract  Artifacts  Deploy|Contract / Artifacts / Deploy]]
- [[_COMMUNITY_Brand  EtherXMeet  Logo|Brand / EtherXMeet / Logo]]
- [[_COMMUNITY_index  connectDB  startServer|index / connectDB / startServer]]
- [[_COMMUNITY_index  findRoomByCode  normalizeCode|index / findRoomByCode / normalizeCode]]
- [[_COMMUNITY_authApi  loginUser  registerUser|authApi / loginUser / registerUser]]
- [[_COMMUNITY_Signup  Insight  Page|Signup / Insight / Page]]
- [[_COMMUNITY_Particle  Network  Background|Particle / Network / Background]]
- [[_COMMUNITY_Live  Translation  LiveTranslation|Live / Translation / LiveTranslation]]
- [[_COMMUNITY_Whiteboard  ToolButton  Canvas|Whiteboard / ToolButton / Canvas]]
- [[_COMMUNITY_VideoGrid  getGridClass|VideoGrid / getGridClass]]
- [[_COMMUNITY_Backend  Stack  connectDB|Backend / Stack / connectDB]]
- [[_COMMUNITY_Polygon  Storage  Status|Polygon / Storage / Status]]
- [[_COMMUNITY_Shader  Background  WebGL|Shader / Background / WebGL]]
- [[_COMMUNITY_Async  Messages  Video|Async / Messages / Video]]
- [[_COMMUNITY_AnimatedPage  Page  Transition|AnimatedPage / Page / Transition]]
- [[_COMMUNITY_CommandPalette  Searchable  Command|CommandPalette / Searchable / Command]]
- [[_COMMUNITY_Controls  Quick  Reference|Controls / Quick / Reference]]
- [[_COMMUNITY_Glitter  Gold  Deterministic|Glitter / Gold / Deterministic]]
- [[_COMMUNITY_Toast  ToastSystem|Toast / ToastSystem]]
- [[_COMMUNITY_Animation  Provider  Reduced|Animation / Provider / Reduced]]
- [[_COMMUNITY_Floating  Video  Tile|Floating / Video / Tile]]

## God Nodes (most connected - your core abstractions)
1. `Glassmorphic Design System` - 14 edges
2. `UI Component Barrel Export` - 13 edges
3. `useWallet()` - 12 edges
4. `UI Demo` - 12 edges
5. `useMeeting()` - 9 edges
6. `Meeting Provider` - 9 edges
7. `useMeetingContract()` - 8 edges
8. `apiClient` - 8 edges
9. `User Model` - 7 edges
10. `RecordingStudio Component` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Graphify AST Extraction Script` --conceptually_related_to--> `EtherXMeet Project Structure`  [AMBIGUOUS]
  _ast_extract.py → EXPLANATION.md
- `Google OAuth` --conceptually_related_to--> `User Model`  [INFERRED]
  EtherXMeet_Product_Document.md → backend/src/models/User.js
- `8x8.vc Video Conferencing` --conceptually_related_to--> `LiveKit Token Route`  [INFERRED]
  EtherXMeet_Product_Document.md → backend/src/routes/livekit.js
- `connectDB` --implements--> `Backend Stack`  [INFERRED]
  backend/src/config/db.js → EtherXMeet_Product_Document.md
- `WebGL Shader Background` --semantically_similar_to--> `Aurora Canvas Mesh Background`  [INFERRED] [semantically similar]
  frontend/public/shader-bg.html → frontend/src/components/effects/AuroraBackground.jsx

## Hyperedges (group relationships)
- **On-Chain Meeting Lifecycle Stack** — EtherXMeet_Product_Document_onchain_lifecycle, EXPLANATION_meetingregistry_contract, EtherXMeet_Product_Document_wallet_authentication, EtherXMeet_Product_Document_chainhud [EXTRACTED 0.90]
- **Backend Auth Recording Video Services** — index_express_app, auth_routes_auth_router, recordings_routes_recordings_router, livekit_token_route, User_user_model, Recording_recording_model [EXTRACTED 0.92]
- **Three Layer Animation System** — 2026_04_12_nexmeet_animation_system_animation_plan, 2026_04_12_nexmeet_animation_system_three_layer_architecture, 2026_04_12_nexmeet_animation_system_design_motion_language, 2026_04_12_nexmeet_animation_system_room_subdued_motion [EXTRACTED 0.93]
- **Frontend Provider Stack** — main_hms_room_provider, App_app_provider_shell, App_AppRoutes, ProtectedRoute_auth_gate [EXTRACTED 0.92]
- **Mock First Conferencing Architecture** — ARCHITECTURE_state_management_layer, ARCHITECTURE_data_logic_layer, MOCK_DATA_README_context_providers, COMPLETION_SUMMARY_production_ready_mock_platform [EXTRACTED 0.88]
- **Animated Brand Background System** — tailwind_glassmorphic_brand_theme, AuroraBackground_canvas_mesh, EtherXBackground_vanta_globe, shader-bg_webgl_shader_background [INFERRED 0.80]
- **AI Assistant Tab Surfaces** — aiassistant_ai_assistant, livetranscription_live_transcription, actionitems_action_items, meetingsummary_meeting_summary, sentimentmeter_sentiment_meter [EXTRACTED 0.98]
- **Live Analytics Overlay Widgets** — analyticsoverlay_analytics_overlay, speakingtimechart_speaking_time_chart, engagementscores_engagement_scores, meetingpace_meeting_pace, participantinsights_participant_insights [EXTRACTED 0.98]
- **Engagement Games Catalog** — engagementgames_engagement_games, engagementgames_game_catalog, quickpoll_quick_poll, emojimoodcheck_emoji_mood_check, leaderboard_leaderboard [EXTRACTED 0.90]
- **Engagement Games Scoring Loop** — SpeedNetworking_component, TriviaQuiz_component, TwoTruthsOneLie_component, WordAssociation_component, SpeedNetworking_score_callback [EXTRACTED 0.93]
- **Recording Studio Settings Flow** — RecordingStudio_component, LayoutSelector_component, QualitySettings_component, RecordingPreview_component, RecordingStudio_settings_payload [EXTRACTED 0.95]
- **Smart Agenda Flow Control** — SmartAgenda_component, SmartAgenda_agenda_items, AgendaItem_component, AgendaProgress_component, MeetingHealth_component, AddItemModal_component [EXTRACTED 0.96]
- **Virtual Background Studio Surface** — index_VirtualBackgroundStudio, BackgroundGallery_BackgroundGallery, BackgroundPreview_BackgroundPreview, BlurSettings_BlurSettings, ColorPicker_ColorPicker, CustomUpload_CustomUpload [EXTRACTED 0.96]
- **Voice Effects Audio Surface** — index_VoiceEffects, EffectCard_EffectCard, Equalizer_Equalizer, index_ToneEffectsChain [EXTRACTED 0.95]
- **Meeting Room Collaboration Controls** — BottomBar_BottomBar, ChatPanel_ChatPanel, MeetingRail_MeetingRail, FloatingReaction_FloatingReaction, BOTTOMBAR_README_MeetingContextContract [EXTRACTED 0.90]
- **Meeting Participant Presence Surface** — participantspanel_participants_panel, videogrid_video_grid, videotile_video_tile, avatar_avatar [INFERRED 0.82]
- **Glassmorphic UI Library** — button_button, modal_modal, input_input, slider_slider, badge_badge, tooltip_tooltip, avatar_avatar, dropdown_dropdown, tabs_tabs, switch_switch, card_card, spinner_spinner, index_ui_component_barrel [EXTRACTED 0.95]
- **UI Accessibility and Interaction Patterns** — modal_focus_trap, dropdown_focus_management, tooltip_tooltip, button_ripple_state, input_focus_glow_state [INFERRED 0.78]
- **Polygon Wallet Receipt Flow** — walletcontext_wallet_provider, usemeetingcontract_meeting_contract_hook, onchainconfirmmodal_on_chain_confirm_modal, meetingreceiptmodal_meeting_receipt_modal, chainproofbadge_chain_proof_badge, usemeetingnft_meeting_nft_hook [INFERRED 0.86]
- **Meeting Mock State Model** — meetingcontext_meeting_provider, participants_participant_seed_data, agenda_agenda_templates, meetings_meeting_seed_data, recordings_recording_seed_data, transcripts_transcript_seed_data, analytics_meeting_analytics [EXTRACTED 0.92]
- **Persistent Frontend Context Layer** — meetingcontext_meeting_provider, usercontext_user_provider, uicontext_ui_provider, uselocalstorage_local_storage_state [EXTRACTED 0.90]
- **Auth Session Flow** — login_login, register_register, authcallback_authcallback, auth_persistauthsession, auth_authsession, apiclient_apiclient [EXTRACTED 1.00]
- **On-Chain Meeting Flow** — landing_landing, join_join, dashboard_dashboard, analytics_analytics, recordings_recordings, room_handleendrecording, ipfs_pinjson, deploy_contractabis [INFERRED 0.84]
- **Lumina Auth Design Family** — design_luminadarkdesignsystem, code_insightaiauthprototype, authshared_authshared, login_login, register_register [INFERRED 0.82]
- **Signup Authentication Options** — screen_apple_auth_option, screen_google_auth_option, screen_email_auth_option [EXTRACTED 0.95]
- **Insight AI Signup Gate Composition** — screen_insight_ai, screen_signup_unlock_rationale, screen_apple_auth_option, screen_google_auth_option, screen_email_auth_option, screen_close_action [EXTRACTED 0.93]

## Communities

### Community 0 - "Video / Focus / Modal"
Cohesion: 0.09
Nodes (39): Avatar, Get Initials, Badge, Button, Button Ripple State, Card, Dropdown, Dropdown Focus Management (+31 more)

### Community 1 - "Auth / Lumina / Dark"
Cohesion: 0.07
Nodes (37): Analytics, ChainStat, ChartCard, MetricRow, Framer Motion Variant Presets, apiClient, getApiErrorMessage, Auth Session LocalStorage (+29 more)

### Community 2 - "ConnectWalletButton / ChainHUD / WalletBanner"
Cohesion: 0.08
Nodes (14): ConnectWalletButton(), useWallet(), useEnsName(), useMediaDevices(), useMeetingContract(), useMeetingNFT(), Analytics(), Dashboard() (+6 more)

### Community 3 - "ProtectedRoute / SpeedNetworking / AgendaItem"
Cohesion: 0.09
Nodes (14): ProtectedRoute(), SpeedNetworking(), formatTime(), Landing(), RecordingStudio(), AgendaItem(), AgendaProgress(), buildStoredUser() (+6 more)

### Community 4 - "Animation / Polygon / Motion"
Cohesion: 0.07
Nodes (28): NexMeet Animation Implementation Plan, Animation System Design Motion Language, Room Subdued Motion Policy, Three Layer Animation Architecture, Deploy Script ABI Sync, MeetingRegistry Smart Contract, EtherXMeet Project Structure, React Entry Flow (+20 more)

### Community 5 - "Control / Chat / Equalizer"
Cohesion: 0.09
Nodes (28): AudioVisualizer, Web Audio Analyser Visualization, MeetingContext Control Contract, EtherXMeet Meeting Control Bar, BackgroundGallery, Preset Backgrounds, BackgroundPreview, BlurSettings (+20 more)

### Community 6 - "Seed / Persistence / Participant"
Cohesion: 0.1
Nodes (25): Agenda Templates, Mock Meeting Analytics, Sentiment Timeline Model, Participant Analytics Snapshot, Async Message Persistence Workflow, Room Collaboration State, Current User Participant Projection, Meeting Provider (+17 more)

### Community 7 - "index / BottomBar / TopBar"
Cohesion: 0.09
Nodes (9): AsyncMessages(), formatDuration(), BreakoutRooms(), useMeeting(), BottomBar(), TopBar(), ChatPanel(), MeetingRail() (+1 more)

### Community 8 - "Chain / Receipt / Registry"
Cohesion: 0.15
Nodes (21): Provider Block Number Polling, Chain HUD, Chain HUD Network Label Map, Chain Proof Badge, PolygonScan Transaction URL, IPFS Gateway Receipt Link, Meeting Receipt Modal, PolygonScan Receipt Link (+13 more)

### Community 9 - "CommandPalette / ToastSystem / useLocalStorage"
Cohesion: 0.11
Nodes (9): createCurrentUserParticipant(), MeetingProvider(), useUI(), UserProvider(), useUserContext(), useLocalStorage(), CommandPalette(), ToastSystem() (+1 more)

### Community 10 - "Summary / Action / Items"
Cohesion: 0.14
Nodes (17): Action Items List, Action Items State, NEXAI Assistant Panel, Export Summary to PDF, Generate Summary Function, Transcript Entries State, Emoji Mood Check, Mood Responses (+9 more)

### Community 11 - "Model / Middleware / Router"
Cohesion: 0.18
Nodes (16): Google OAuth, Recording Model, removeSensitiveFields, User Model, JWT Auth Middleware, Authentication Router, Password Reset Flow, sanitizeUser (+8 more)

### Community 12 - "Room / Provider / Root"
Cohesion: 0.15
Nodes (16): AppRoutes, App Provider Shell, Protected Route Group, ProtectedRoute Auth Gate, isAuthenticated Check, HTML Root Mount, 100ms HMS Room Provider, LocalStorage Data Version Reset (+8 more)

### Community 13 - "Recording / Controls / ActivityLog"
Cohesion: 0.21
Nodes (14): ActivityLog Component, LayoutSelector Component, ParticipantControls Component, QualitySettings Component, RecordingIndicator Component, RecordingPreview Component, RecordingStudio Component, Meeting Context Recording Controls (+6 more)

### Community 14 - "Sign / Button / Input"
Cohesion: 0.21
Nodes (12): Dark Theme Design System, Purple Accent Color Scheme, Insight AI Sign-Up Screen, Insight AI Product, Create Account CTA Button, Email Address Input Field, Full Name Input Field, Password Input Field (+4 more)

### Community 15 - "Analytics / Rooms / Participant"
Cohesion: 0.36
Nodes (9): Analytics Data State, Analytics Overlay, Breakout Rooms, Participant Pool, Rooms State, Engagement Scores, Meeting Pace, Participant Insights (+1 more)

### Community 16 - "Scheduler / AddItemModal / AgendaItem"
Cohesion: 0.33
Nodes (9): AddItemModal Component, AgendaItem Component, AgendaProgress Component, MeetingHealth Component, Scheduler Component, Scheduler ICS Export, Scheduled Meeting Payload, Smart Agenda Items State (+1 more)

### Community 17 - "Continue / with / Option"
Cohesion: 0.28
Nodes (9): Continue with Apple Option, Close Action, Dark Centered Authentication Layout, Continue with Email Option, Email Input Field, Continue with Google Option, Insight AI, Insight AI Signup Gate Screenshot (+1 more)

### Community 18 - "Dashboard / Layer / Card"
Cohesion: 0.25
Nodes (8): Data and Logic Layer, EtherXMeet Frontend Architecture, Feature Module Pattern, State Management Layer, Dashboard Collaborator Avatar, Mock Data Context Providers, Dashboard Meeting Card, Dashboard Metric Card

### Community 19 - "Word / SpeedNetworking / Speed"
Cohesion: 0.32
Nodes (8): SpeedNetworking Component, Speed Networking Score Callback, TriviaQuiz Component, Trivia Quiz Question Bank, TwoTruthsOneLie Component, Two Truths One Lie Mock Players, WordAssociation Component, Word Association Word Cloud

### Community 20 - "Button / Continue / with"
Cohesion: 0.39
Nodes (8): Continue with Apple OAuth Button, Close Modal Button, Continue with Email Button, Email Input Field for Sign-Up, Continue with Google OAuth Button, Dark Theme UI Design Pattern, Insight AI Product, Insight AI Sign-Up Modal Screen

### Community 21 - "AnimatedPage / CustomCursor / AnimationProvider"
Cohesion: 0.29
Nodes (3): useAnimation(), AnimatedPage(), CustomCursor()

### Community 23 - "apiClient / meetingApi / getApiErrorMessage"
Cohesion: 0.47
Nodes (4): getApiErrorMessage(), createRoom(), getJoinToken(), post()

### Community 24 - "Background / Aurora / Canvas"
Cohesion: 0.4
Nodes (6): Aurora Canvas Mesh Background, Production Ready Mock Conferencing Platform, Vanta Globe EtherX Background, Fifteen Advanced Features, WebGL Shader Background, Glassmorphic Brand Theme

### Community 25 - "Contract / Artifacts / Deploy"
Cohesion: 0.4
Nodes (5): Frontend Contract ABI Artifacts, Deploy MeetingRegistry And MeetingNFT, fetchJSON, pinJSON, handleEndMeeting

### Community 26 - "Brand / EtherXMeet / Logo"
Cohesion: 0.7
Nodes (5): EtherXMeet Brand Logo, Web3 Premium Brand Style, Gold/Brass Color Palette, Shield/Crest Icon, EtherX Meet Wordmark

### Community 27 - "index / connectDB / startServer"
Cohesion: 0.5
Nodes (2): connectDB(), startServer()

### Community 29 - "index / findRoomByCode / normalizeCode"
Cohesion: 0.67
Nodes (2): findRoomByCode(), normalizeCode()

### Community 31 - "authApi / loginUser / registerUser"
Cohesion: 0.83
Nodes (3): loginUser(), registerUser(), submitAuth()

### Community 32 - "Signup / Insight / Page"
Cohesion: 0.5
Nodes (4): Insight AI Signup Page, Social and Email Signup Options, Stitch Insight AI Account Page, Tailwind Material Theme Signup UI

### Community 33 - "Particle / Network / Background"
Cohesion: 0.5
Nodes (4): Particle Background, Canvas Particle System, Mouse Repulsion Particle Network, Particle Network

### Community 34 - "Live / Translation / LiveTranslation"
Cohesion: 0.67
Nodes (4): LiveTranslation Component, Live Translation Language Catalog, Live Translation Subtitle State, SubtitleDisplay Component

### Community 35 - "Whiteboard / ToolButton / Canvas"
Cohesion: 0.67
Nodes (4): Whiteboard ToolButton, Whiteboard, Whiteboard Canvas Model, Whiteboard Export

### Community 45 - "VideoGrid / getGridClass"
Cohesion: 1.0
Nodes (2): getGridClass(), VideoGrid()

### Community 48 - "Backend / Stack / connectDB"
Cohesion: 0.67
Nodes (3): Backend Stack, connectDB, startServer

### Community 49 - "Polygon / Storage / Status"
Cohesion: 0.67
Nodes (3): Polygon Storage Status Badge, Polygonscan Explorer Link, MetaMask Wallet Connection Button

### Community 50 - "Shader / Background / WebGL"
Cohesion: 0.67
Nodes (3): Shader Background, WebGL Beams and Blobs Shader, Video Background

### Community 51 - "Async / Messages / Video"
Cohesion: 1.0
Nodes (3): Async Video Messages, Media Recorder Flow, Saved Async Messages

### Community 52 - "AnimatedPage / Page / Transition"
Cohesion: 0.67
Nodes (3): AnimatedPage, Page Transition Animation Gate, CustomCursor

### Community 53 - "CommandPalette / Searchable / Command"
Cohesion: 0.67
Nodes (3): CommandPalette, Searchable Command Items, Sidebar

### Community 128 - "Controls / Quick / Reference"
Cohesion: 1.0
Nodes (2): Meeting Controls Quick Reference, User Onboarding and Overview

### Community 129 - "Glitter / Gold / Deterministic"
Cohesion: 1.0
Nodes (2): Gold Glitter, Deterministic Glitter Particles

### Community 130 - "Toast / ToastSystem"
Cohesion: 1.0
Nodes (2): Toast, ToastSystem

### Community 131 - "Animation / Provider / Reduced"
Cohesion: 1.0
Nodes (2): Animation Provider, Reduced Motion Animation Gate

### Community 152 - "Floating / Video / Tile"
Cohesion: 1.0
Nodes (1): Floating Video Tile

## Ambiguous Edges - Review These
- `EtherXMeet Project Structure` → `Graphify AST Extraction Script`  [AMBIGUOUS]
  _ast_extract.py · relation: conceptually_related_to
- `Engagement Game Scores` → `Poll Votes`  [AMBIGUOUS]
  frontend/src/components/features/EngagementGames/games/QuickPoll.jsx · relation: conceptually_related_to
- `SecurityPanel Component` → `ParticipantControls Component`  [AMBIGUOUS]
  frontend/src/components/features/SecurityPanel/index.jsx · relation: references

## Knowledge Gaps
- **119 isolated node(s):** `React Entry Flow`, `Deploy Script ABI Sync`, `Wallet Authentication`, `ChainHUD`, `Backend Stack` (+114 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `index / connectDB / startServer`** (4 nodes): `db.js`, `index.js`, `connectDB()`, `startServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `index / findRoomByCode / normalizeCode`** (4 nodes): `index.js`, `findRoomByCode()`, `normalizeCode()`, `requireHmsConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `VideoGrid / getGridClass`** (3 nodes): `VideoGrid.jsx`, `getGridClass()`, `VideoGrid()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Controls / Quick / Reference`** (2 nodes): `Meeting Controls Quick Reference`, `User Onboarding and Overview`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Glitter / Gold / Deterministic`** (2 nodes): `Gold Glitter`, `Deterministic Glitter Particles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Toast / ToastSystem`** (2 nodes): `Toast`, `ToastSystem`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Animation / Provider / Reduced`** (2 nodes): `Animation Provider`, `Reduced Motion Animation Gate`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Floating / Video / Tile`** (1 nodes): `Floating Video Tile`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **How does Graphify AST Extraction Script connect to EtherXMeet Project Structure?**
  _Surprising cross-community connection_
- **How does Google OAuth connect to User Model?**
  _Surprising cross-community connection_
- **How does 8x8.vc Video Conferencing connect to LiveKit Token Route?**
  _Surprising cross-community connection_
- **How does connectDB connect to Backend Stack?**
  _Surprising cross-community connection_
- **How does WebGL Shader Background connect to Aurora Canvas Mesh Background?**
  _Surprising cross-community connection_