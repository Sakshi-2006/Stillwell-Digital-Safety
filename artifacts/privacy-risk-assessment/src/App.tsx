import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, CheckCircle2,
  ChevronRight, CircleHelp, Download, FileCheck2, FileText, Fingerprint, Gauge, KeyRound,
  LockKeyhole, Printer, RotateCcw, Shield, ShieldCheck, Sparkles, Trash2, TrendingDown,
  TriangleAlert, Users,
} from 'lucide-react';
import {
  getGetAssessmentQueryKey, getGetAssessmentRecommendationsQueryKey, getGetDashboardStatsQueryKey,
  useCreateAssessment, useDeleteAssessment,
  useGetAssessment, useGetAssessmentRecommendations, useGetDashboardStats,
  useGetPrivacyChecklist, useSimulateImprovement,
} from '@workspace/api-client-react';
import type { ChecklistItem, RiskLevel, SimulationResult } from '@workspace/api-client-react';

const queryClient = new QueryClient();
let transientAnswers: Record<string, string> | null = null;

type AnswerKind = 'visibility' | 'control' | 'behavior';
type Question = { id: string; prompt: string; kind: AnswerKind };
type QuestionGroup = { category: string; questions: Question[] };
const questionGroups: QuestionGroup[] = [
  { category: 'Profile Exposure', questions: [
    { id: 'profile_public', prompt: 'Who can view your profile content?', kind: 'visibility' },
    { id: 'profile_searchable', prompt: 'Have you disabled search-engine visibility for your social profile?', kind: 'control' },
    { id: 'profile_followers_public', prompt: 'Who can see your follower list?', kind: 'visibility' },
    { id: 'profile_friends_public', prompt: 'Who can see your friends or connections list?', kind: 'visibility' },
    { id: 'profile_activity_public', prompt: 'Have you limited activity-status and last-seen visibility to trusted contacts?', kind: 'control' },
  ] },
  { category: 'Personal Information', questions: [
    { id: 'phone_public', prompt: 'If a phone number is displayed on your profile, who can view it?', kind: 'visibility' },
    { id: 'email_public', prompt: 'If an email address is displayed on your profile, who can view it?', kind: 'visibility' },
    { id: 'birthday_public', prompt: 'Who can view birthday information on your profile?', kind: 'visibility' },
    { id: 'workplace_public', prompt: 'Who can view workplace information on your profile?', kind: 'visibility' },
    { id: 'education_public', prompt: 'If school, college, or other education details are displayed on your profile, who can view them?', kind: 'visibility' },
    { id: 'family_details_public', prompt: 'Who can view family or relationship details on your profile?', kind: 'visibility' },
  ] },
  { category: 'Location Exposure', questions: [
    { id: 'live_location', prompt: 'How often do you share your current location while you are still there?', kind: 'behavior' },
    { id: 'checkins_public', prompt: 'How often do you publicly share check-ins or location tags while you are there?', kind: 'behavior' },
    { id: 'geotagging_enabled', prompt: 'How often do you leave geotagging enabled when sharing photos or posts?', kind: 'behavior' },
    { id: 'travel_plans_public', prompt: 'How often do you share travel plans publicly before or during a trip?', kind: 'behavior' },
    { id: 'routine_location_public', prompt: 'How often could repeated posts reveal places or times in your daily routine?', kind: 'behavior' },
  ] },
  { category: 'Content Exposure', questions: [
    { id: 'posts_public', prompt: 'Who can view your posts by default?', kind: 'visibility' },
    { id: 'children_photos_public', prompt: 'How often are photos of children or minors shared with a broad audience?', kind: 'behavior' },
    { id: 'photo_background_checked', prompt: 'Do you check a photo’s background for personal details before sharing it?', kind: 'control' },
    { id: 'photo_metadata_reviewed', prompt: 'Do you review location or other metadata settings for photos before sharing?', kind: 'control' },
    { id: 'reposts_reviewed', prompt: 'Do you check the audience and context before reposting content?', kind: 'control' },
  ] },
  { category: 'Connection Risk', questions: [
    { id: 'unknown_requests_accepted', prompt: 'How often do you accept connection requests from people you do not recognize?', kind: 'behavior' },
    { id: 'connections_reviewed', prompt: 'Do you review your connections from time to time?', kind: 'control' },
    { id: 'public_dms_open', prompt: 'Have you restricted direct messages and message requests to people you know?', kind: 'control' },
    { id: 'unknown_connections_verified', prompt: 'Do you verify unfamiliar connections before engaging with them?', kind: 'control' },
    { id: 'follower_changes_reviewed', prompt: 'Do you review changes to your followers or connections when available?', kind: 'control' },
  ] },
  { category: 'Tagging Risk', questions: [
    { id: 'tag_review_enabled', prompt: 'Is tag review enabled before tagged posts appear on your profile?', kind: 'control' },
    { id: 'mentions_restricted', prompt: 'Have you limited who can mention or tag you?', kind: 'control' },
    { id: 'tagged_posts_reviewed', prompt: 'Do you review posts where you are tagged?', kind: 'control' },
    { id: 'auto_profile_tags_disabled', prompt: 'Have you turned off automatic display of tagged posts on your profile?', kind: 'control' },
    { id: 'tagging_notifications_enabled', prompt: 'Are notifications enabled so you can review new tags or mentions?', kind: 'control' },
  ] },
  { category: 'Account Security', questions: [
    { id: 'mfa_enabled', prompt: 'Is multi-factor or two-step verification enabled on your social accounts?', kind: 'control' },
    { id: 'password_unique', prompt: 'Do you use a different password for each social account?', kind: 'control' },
    { id: 'password_manager_used', prompt: 'Do you use a password manager to help keep passwords unique?', kind: 'control' },
    { id: 'login_alerts_enabled', prompt: 'Are alerts for new or unfamiliar sign-ins enabled?', kind: 'control' },
    { id: 'sessions_reviewed', prompt: 'Do you review active sessions and sign out of devices you no longer use?', kind: 'control' },
  ] },
  { category: 'Third-Party Apps', questions: [
    { id: 'third_party_apps_reviewed', prompt: 'Do you review which third-party apps are connected to your accounts?', kind: 'control' },
    { id: 'unused_apps_removed', prompt: 'Do you remove connected apps you no longer use?', kind: 'control' },
    { id: 'app_permissions_reviewed', prompt: 'Do you review the permissions requested by connected apps?', kind: 'control' },
    { id: 'old_integrations_checked', prompt: 'Do you check for older integrations that may still have account access?', kind: 'control' },
    { id: 'least_privilege_used', prompt: 'When granting app access, do you choose only the permissions needed?', kind: 'control' },
  ] },
  { category: 'Social Engineering', questions: [
    { id: 'unexpected_links_checked', prompt: 'Do you check the source of unexpected links before opening them?', kind: 'control' },
    { id: 'verification_codes_shared', prompt: 'How often do you share a sign-in or verification code when someone asks?', kind: 'behavior' },
    { id: 'suspicious_dms_reported', prompt: 'Do you report direct messages that seem suspicious?', kind: 'control' },
    { id: 'impersonation_verified', prompt: 'Do you verify unusual requests through a separate trusted channel?', kind: 'control' },
    { id: 'personal_details_in_dms', prompt: 'How often do you share personal details in direct messages with people you do not know well?', kind: 'behavior' },
  ] },
  { category: 'Digital Footprint', questions: [
    { id: 'old_posts_reviewed', prompt: 'Do you review older posts that may still be visible?', kind: 'control' },
    { id: 'unused_accounts_reviewed', prompt: 'Do you review social accounts you no longer use?', kind: 'control' },
    { id: 'public_comments_reviewed', prompt: 'Do you review public comments associated with your profiles?', kind: 'control' },
    { id: 'privacy_settings_reviewed', prompt: 'Do you review privacy settings when platforms change or add features?', kind: 'control' },
    { id: 'linked_profiles_reviewed', prompt: 'Do you review profiles or accounts linked to your social accounts?', kind: 'control' },
  ] },
];
const questions = questionGroups.flatMap((group) => group.questions.map((question) => ({ ...question, category: group.category })));
const answerOptions: Record<AnswerKind, string[]> = {
  visibility: ['PUBLIC', 'FRIENDS', 'PRIVATE', 'NOT_SURE'],
  control: ['YES', 'NO', 'SOMETIMES', 'NOT_SURE'],
  behavior: ['OFTEN', 'SOMETIMES', 'RARELY', 'NEVER', 'NOT_SURE'],
};
const optionLabels: Record<string, string> = {
  PUBLIC: 'Anyone (public)',
  FRIENDS: 'Friends or connections',
  PRIVATE: 'Private / approved people',
  YES: 'Yes',
  NO: 'No',
  SOMETIMES: 'Sometimes',
  OFTEN: 'Often',
  RARELY: 'Rarely',
  NEVER: 'Never',
  NOT_SURE: 'Not sure',
};
const scoreLabels: Record<RiskLevel, string> = { LOW: 'Lower risk', MODERATE: 'Moderate risk', HIGH: 'Higher risk', CRITICAL: 'Critical risk' };
const labelClass: Record<RiskLevel, string> = { LOW: 'risk-low', MODERATE: 'risk-moderate', HIGH: 'risk-high', CRITICAL: 'risk-critical' };
function AppFrame({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const links = [
    { href: '/', label: 'Overview', icon: Gauge },
    { href: '/assessment', label: 'Assessment', icon: FileCheck2 },
    { href: '/learn', label: 'Learn', icon: BookOpen },
  ];
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Main navigation">
      <Link href="/" className="flex items-center gap-3 mb-11 px-2 no-underline" data-testid="link-brand-home">
        <span className="brand-mark"><Shield size={19} strokeWidth={1.8}/></span>
        <span className="sidebar-brand-copy"><span className="block font-display text-lg leading-none text-[#f6f4eb]">Stillwell</span><span className="block mt-1 text-[10px] uppercase tracking-[.19em] text-[#b8c9be]">Digital safety</span></span>
      </Link>
      <div className="sidebar-brand-copy eyebrow !text-[#9db6a9] px-3 mb-3">Your space</div>
      <nav className="flex flex-col gap-1" aria-label="Primary">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={location === href ? 'page' : undefined} className={`side-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}>
          <Icon size={18} strokeWidth={1.8}/><span>{label}</span>
        </Link>)}
      </nav>
      <div className="sidebar-note mt-auto rounded-xl border border-white/10 bg-white/[.045] p-4">
        <div className="flex gap-2 items-center text-[#e2c37f] mb-2"><LockKeyhole size={15}/><span className="text-xs font-semibold">Private by design</span></div>
        <p className="text-xs leading-relaxed text-[#c1d0c7] m-0">You answer for yourself. We do not scan accounts or ask for identifying details.</p>
      </div>
      <div className="sidebar-bottom px-3 pt-5 text-[10px] uppercase tracking-[.15em] text-[#9db6a9]">A little more control, one choice at a time</div>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <div className="flex items-center gap-2 text-sm text-[#6b8178]"><span className="w-2 h-2 rounded-full bg-[#80a48c]"></span>Educational privacy framework</div>
        <Link href="/learn" className="flex items-center gap-2 text-sm text-[#315f51] no-underline hover:underline" data-testid="link-top-learn"><CircleHelp size={17}/> How this works</Link>
      </header>
      {children}
    </div>
  </div>;
}

function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#e7c9b5] bg-[#fbf0e8] p-4 text-sm text-[#714b3e]" data-testid="status-error">
    <TriangleAlert size={18} className="mt-0.5 shrink-0"/><div className="flex-1"><p className="m-0 font-semibold">We couldn’t load this just now.</p><p className="mt-1 mb-0">{message}</p></div>
    {retry && <button onClick={retry} className="inline-flex items-center gap-1 font-semibold underline" data-testid="button-retry">Try again <RotateCcw size={14}/></button>}
  </div>;
}

function LoadingBlocks() {
  return <div className="space-y-4 animate-pulse" aria-label="Loading content" data-testid="status-loading"><div className="h-40 rounded-2xl bg-[#e9e8df]"/><div className="grid md:grid-cols-3 gap-4"><div className="h-28 rounded-xl bg-[#e9e8df]"/><div className="h-28 rounded-xl bg-[#e9e8df]"/><div className="h-28 rounded-xl bg-[#e9e8df]"/></div></div>;
}

function RiskPill({ level }: { level: RiskLevel }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${labelClass[level]}`} data-testid={`status-risk-${level.toLowerCase()}`}><span className="w-1.5 h-1.5 rounded-full bg-current"/>{scoreLabels[level]}</span>;
}

function Dashboard() {
  const { data: stats, isLoading, isError, refetch } = useGetDashboardStats();
  const [, setLocation] = useLocation();
  return <main className="page-wrap reveal">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
      <div><div className="eyebrow mb-3">A clearer view of your digital footprint</div><h1 className="display-title text-[clamp(38px,5vw,61px)] m-0">Small steps.<br/><span className="text-[#9c7b43]">More say.</span></h1>
        <p className="mt-4 mb-0 max-w-[530px] text-[15px] leading-7 text-[#647870]">A private, self-guided check-in to help you understand where everyday social media habits may create exposure.</p>
      </div>
      <button onClick={() => setLocation('/assessment')} className="inline-flex shrink-0 items-center justify-center gap-3 rounded-lg bg-[#285548] px-5 py-3.5 text-sm font-semibold text-[#f9f7ef] hover:bg-[#1e453b] transition-colors" data-testid="button-start-assessment">Start your assessment <ArrowRight size={17}/></button>
    </div>
    <div className="dashboard-hero px-6 py-7 md:px-9 md:py-8 mb-6">
      <div className="relative z-[1] grid md:grid-cols-[1.25fr_1fr] gap-8 items-center">
        <div><div className="eyebrow !text-[#628074] mb-3">A private check-in, not a scan</div><h2 className="font-display text-[28px] md:text-[34px] leading-tight tracking-[-.035em] text-[#214940] m-0">Understand the choices<br className="hidden md:block"/> that shape your exposure.</h2>
          <p className="text-sm leading-6 text-[#5c746b] max-w-[510px] mt-3 mb-5">Answer 51 short questions about your own settings and habits. No account access, identifying details, or private messages are needed.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#45665b]"><span className="inline-flex gap-1.5 items-center"><LockKeyhole size={14}/> Answers stay in this session</span><span className="inline-flex gap-1.5 items-center"><BadgeCheck size={14}/> Clear, practical next steps</span></div>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative flex items-center justify-center w-[190px] h-[190px] rounded-full border border-[#bacabc] bg-[#eff1e6]/70">
            <div className="absolute inset-[16px] rounded-full border border-[#c9d3c6]"></div><div className="absolute inset-[33px] rounded-full border border-[#d2dacd]"></div>
            <div className="relative w-[90px] h-[90px] rounded-full bg-[#285548] text-[#e5c982] grid place-items-center shadow-lg"><ShieldCheck size={37} strokeWidth={1.4}/></div>
            <span className="absolute -top-2 right-6 bg-[#f7f4e9] px-3 py-1 rounded-full border border-[#d7dece] text-[10px] uppercase tracking-[.1em] text-[#58786a]">Your control</span>
            <span className="absolute -bottom-2 left-1 bg-[#f7f4e9] px-3 py-1 rounded-full border border-[#d7dece] text-[10px] uppercase tracking-[.1em] text-[#58786a]">Your pace</span>
          </div>
        </div>
      </div>
    </div>
    <div className="grid lg:grid-cols-[1.4fr_.8fr] gap-6">
      <section className="panel p-5 md:p-7" aria-labelledby="cohort-heading">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div><div className="eyebrow mb-2">Community snapshot</div><h2 id="cohort-heading" className="font-display text-[23px] tracking-[-.025em] text-[#294f45] m-0">Patterns, not profiles</h2></div>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#72857b]"><Users size={14}/> Synthetic cohort insights</span>
        </div>
        {isLoading ? <div className="space-y-3 animate-pulse" data-testid="status-dashboard-loading"><div className="h-14 rounded bg-[#efeee7]"/><div className="h-14 rounded bg-[#efeee7]"/><div className="h-14 rounded bg-[#efeee7]"/></div> :
        isError || !stats ? <ErrorNotice message="Synthetic dashboard analytics are unavailable right now. No sample values are substituted." retry={() => { void refetch(); }}/> :
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-7">
            <div className="metric pl-0 border-0"><div className="font-mono text-[25px] text-[#295b4c]" data-testid="text-cohort-records">{stats.syntheticRecords.toLocaleString()}</div><div className="mt-1 text-xs text-[#71837b]">synthetic check-ins</div></div>
            <div className="metric"><div className="font-mono text-[25px] text-[#295b4c]" data-testid="text-cohort-average">{stats.averageScore}<span className="text-sm">/100</span></div><div className="mt-1 text-xs text-[#71837b]">average risk score</div></div>
            <div className="metric"><div className="font-mono text-[25px] text-[#295b4c]" data-testid="text-cohort-high-risk-categories">{stats.highRiskCategories}</div><div className="mt-1 text-xs text-[#71837b]">high-risk categories / profile</div></div>
            <div className="metric"><div className="font-mono text-[25px] text-[#295b4c]" data-testid="text-cohort-controls">{stats.securityControlsEnabled}</div><div className="mt-1 text-xs text-[#71837b]">controls on average</div></div>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div><div className="flex items-center gap-2 text-xs font-semibold text-[#45665b] mb-4"><Activity size={15}/> Average category risk</div>
              <div className="space-y-3">{stats.categoryScores.map((item) => <div key={item.category} data-testid={`row-category-${item.category.toLowerCase().replaceAll(' ', '-')}`}>
                <div className="flex justify-between text-xs text-[#63766e] mb-1.5"><span>{item.category}</span><span className="font-mono text-[#466458]">{item.score}</span></div><div className="risk-bar"><div className="risk-fill" style={{ width: `${item.score}%` }}/></div>
              </div>)}</div>
              <div className="mt-6 border-t border-[#e5e4da] pt-4"><div className="text-xs font-semibold text-[#45665b] mb-3">Common synthetic findings</div><div className="space-y-2">{stats.topWeaknesses.map((item) => <div key={item.label} className="flex justify-between gap-3 text-xs text-[#63766e]" data-testid={`row-synthetic-finding-${item.label.toLowerCase().replaceAll(' ', '-')}`}><span>{item.label}</span><span className="font-mono text-[#466458]">{item.count.toLocaleString()}</span></div>)}</div></div>
            </div>
            <div><div className="flex items-center gap-2 text-xs font-semibold text-[#45665b] mb-4"><TrendingDown size={15}/> Cohort risk bands</div>
              <div className="space-y-3">{stats.riskDistribution.map((row) => <div key={row.level} className="flex items-center gap-2" data-testid={`row-risk-distribution-${row.level.toLowerCase()}`}><span className={`w-[75px] text-[11px] font-semibold ${labelClass[row.level].split(' ')[0].replace('risk-', 'text-')}`}>{scoreLabels[row.level]}</span><div className="risk-bar flex-1"><div className="risk-fill" style={{ width: `${row.percent}%`, background: row.level === 'LOW' ? '#6f9e7f' : row.level === 'CRITICAL' ? '#b75b51' : undefined }}/></div><span className="font-mono w-10 text-right text-xs text-[#677c72]">{row.percent}%</span></div>)}</div>
              <div className="mt-5 rounded-lg bg-[#f2f0e6] p-3 text-[11px] leading-5 text-[#697c73]">Higher scores indicate more potential exposure. Cohort data is synthetic and does not represent individual users.</div>
            </div>
          </div>
        </>}
      </section>
      <aside className="flex flex-col gap-5">
        <section className="panel p-5 md:p-6"><div className="eyebrow mb-2">Why this exists</div><h2 className="font-display text-[22px] leading-tight text-[#294f45] m-0">You are more than a score.</h2><p className="text-sm leading-6 text-[#6b7c74] mt-3 mb-4">This educational framework can help you spot habits worth a second look. It is not a real-world safety guarantee or a judgment about you.</p><Link href="/learn" className="inline-flex gap-2 items-center text-sm font-semibold text-[#315f51] no-underline hover:underline" data-testid="link-learn-framework">Explore the guide <ArrowRight size={15}/></Link></section>
        <section className="rounded-xl bg-[#e9e6d8] p-5"><div className="flex items-center gap-2 text-[#866c3e]"><Sparkles size={16}/><span className="text-xs font-semibold uppercase tracking-[.08em]">Start at your own pace</span></div><p className="text-sm leading-6 text-[#586b62] mt-3 mb-0">You can skip what you are unsure about. Your answers are only held in this browser session while you complete the assessment.</p></section>
      </aside>
    </div>
    <footer className="mt-8 flex items-start gap-2 text-xs leading-5 text-[#829087]"><LockKeyhole size={14} className="mt-0.5 shrink-0"/> We never ask for a password, account handle, real name, private messages, or exact location.</footer>
  </main>;
}

function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [, setLocation] = useLocation();
  const createAssessment = useCreateAssessment();
  const totalPages = questionGroups.length;
  const group = questionGroups[page];
  const questionOffset = questionGroups.slice(0, page).reduce((total, current) => total + current.questions.length, 0);
  const ids = group.questions.map((question) => question.id);
  const answered = ids.every((id) => answers[id]);
  const submit = () => {
    transientAnswers = { ...answers };
    createAssessment.mutate({ data: { answers } }, { onSuccess: (report) => setLocation(`/report/${encodeURIComponent(report.assessmentId)}`) });
  };
  const answeredCount = Object.keys(answers).length;
  return <main className="page-wrap reveal max-w-[1040px]">
    <div className="flex items-center justify-between mb-7"><div><div className="eyebrow mb-2">Private self-check · about 6 minutes</div><h1 className="display-title text-[clamp(32px,4vw,48px)] m-0">Your everyday settings.</h1></div><Link href="/" className="no-print inline-flex items-center gap-2 text-sm text-[#5c746b] no-underline hover:text-[#285548]" data-testid="link-assessment-home"><ArrowLeft size={16}/> Overview</Link></div>
    <div className="panel p-5 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div><span className="eyebrow">Part {page + 1} of {totalPages}</span><h2 className="font-display text-2xl text-[#294f45] mt-1 mb-0">{group.category}</h2></div>
        <span className="font-mono text-xs text-[#819087]" data-testid="text-assessment-progress">{answeredCount} of {questions.length} answered</span>
      </div>
      <div className="risk-bar mb-2"><div className="h-full rounded-full bg-[#315f51] transition-all" style={{ width: `${((page + 1) / totalPages) * 100}%` }}/></div>
      <div className="flex gap-1.5 mb-8" aria-label={`${page + 1} of ${totalPages} sections complete`}>{questionGroups.map((_, index) => <span key={index} className={`step-dot ${index <= page ? 'done' : ''}`} aria-hidden="true"/>)}</div>
      <div className="space-y-8">
        {group.questions.map((question, localIndex) => <fieldset key={question.id} className="border-0 p-0 m-0" data-testid={`question-${question.id}`}>
          <legend className="mb-3 text-[15px] font-semibold leading-6 text-[#36584e]"><span className="font-mono mr-2 text-xs text-[#9a895e]">{String(questionOffset + localIndex + 1).padStart(2, '0')}</span>{question.prompt}</legend>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {answerOptions[question.kind].map((option) => <button type="button" role="radio" aria-checked={answers[question.id] === option} key={option} onClick={() => setAnswers((old) => ({ ...old, [question.id]: option }))} className={`question-option ${answers[question.id] === option ? 'selected' : ''}`} data-testid={`answer-${question.id}-${option.toLowerCase()}`}>
              <span className="radio-dot" aria-hidden="true"/><span className="text-sm">{optionLabels[option] ?? option}</span>{answers[question.id] === option && <Check size={15} className="ml-auto text-[#315f51]"/>}
            </button>)}
          </div>
        </fieldset>)}
      </div>
      <p className="flex items-start gap-2 mt-7 mb-0 text-xs leading-5 text-[#7b8c82]"><LockKeyhole size={14} className="shrink-0 mt-0.5"/> Please do not enter identifying details. Your answers remain in temporary page state and are sent only as questionnaire choices.</p>
      {createAssessment.isError && <div className="mt-5"><ErrorNotice message="Your answers have not been stored. Please check your connection and try submitting again." retry={() => submit()}/></div>}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-7 pt-5 border-t border-[#e7e5dc]">
        <button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#dce0d6] px-4 py-3 text-sm text-[#526c61] disabled:opacity-40" data-testid="button-previous-section"><ArrowLeft size={16}/> Previous</button>
        {page < totalPages - 1 ?
          <button disabled={!answered} onClick={() => { setPage((current) => Math.min(totalPages - 1, current + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#285548] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40" data-testid="button-next-section">Continue <ArrowRight size={16}/></button> :
          <button disabled={!answered || createAssessment.isPending} onClick={submit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#285548] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" data-testid="button-submit-assessment">{createAssessment.isPending ? 'Preparing your report…' : 'See my report'} <ArrowRight size={16}/></button>}
      </div>
    </div>
    <p className="text-center text-[11px] leading-5 text-[#859188] mt-5">This educational score is a conversation starter, not a real-world safety guarantee. Higher scores mean more potential risk in the areas covered.</p>
  </main>;
}

function ScoreMeter({ score, level }: { score: number; level: RiskLevel }) {
  const color = level === 'LOW' ? '#6f9e7f' : level === 'MODERATE' ? '#c6a45f' : level === 'HIGH' ? '#cb815d' : '#b75b51';
  return <div className="flex flex-col items-center">
    <div className="relative w-[190px] h-[190px] rounded-full grid place-items-center" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e7e7dc ${score * 3.6}deg)` }}>
      <div className="absolute inset-[11px] rounded-full bg-[#fbfaf5] flex flex-col items-center justify-center"><span className="font-mono text-[48px] leading-none tracking-[-.08em] text-[#2b5046]" data-testid="text-report-score">{score}</span><span className="mt-2 text-[10px] uppercase tracking-[.16em] text-[#849188]">out of 100</span></div>
    </div><div className="mt-4"><RiskPill level={level}/></div>
  </div>;
}

function ReportPage() {
  const { id = '' } = useParams<{ id: string }>();
  const decodedId = decodeURIComponent(id);
  const { data: report, isLoading, isError, refetch } = useGetAssessment(decodedId, { query: { enabled: !!decodedId, queryKey: getGetAssessmentQueryKey(decodedId) } });
  const { data: recommendations } = useGetAssessmentRecommendations(decodedId, { query: { enabled: !!decodedId, queryKey: getGetAssessmentRecommendationsQueryKey(decodedId) } });
  const deletion = useDeleteAssessment();
  const simulation = useSimulateImprovement();
  const [selected, setSelected] = useState<string[]>([]);
  const [removed, setRemoved] = useState(false);
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const recs = recommendations ?? report?.recommendations ?? [];
  const removeReport = () => {
    if (!window.confirm('Delete this assessment and its derived details? This cannot be undone.')) return;
    deletion.mutate({ id: decodedId }, { onSuccess: () => {
      transientAnswers = null;
      setRemoved(true);
      void client.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
    } });
  };
  const runSimulation = () => {
    if (!transientAnswers || selected.length === 0) return;
    simulation.mutate({ data: { answers: transientAnswers, improvements: selected } });
  };
  const exportReport = () => {
    if (!report) return;
    const file = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `stillwell-report-${report.assessmentId}.json`; anchor.click();
    URL.revokeObjectURL(url);
  };
  if (isLoading) return <main className="page-wrap"><LoadingBlocks/></main>;
  if (removed) return <main className="page-wrap"><div className="panel max-w-xl mx-auto p-8 text-center"><CheckCircle2 size={34} className="mx-auto text-[#5e8c72]"/><h1 className="font-display text-3xl text-[#294f45]">Assessment deleted</h1><p className="text-sm leading-6 text-[#718078]">The report and its derived details have been removed.</p><button onClick={() => setLocation('/')} className="mt-3 rounded-lg bg-[#285548] px-5 py-3 text-sm text-white" data-testid="button-return-overview">Return to overview</button></div></main>;
  if (isError || !report) return <main className="page-wrap max-w-3xl"><ErrorNotice message="This report may have expired or been removed. Please try again or return to the overview." retry={() => { void refetch(); }}/><Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm text-[#315f51] no-underline" data-testid="link-report-overview"><ArrowLeft size={15}/> Overview</Link></main>;
  return <main className="page-wrap reveal max-w-[1120px]">
    <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-7">
      <div><div className="eyebrow mb-2">Your private results</div><h1 className="display-title text-[clamp(34px,4vw,48px)] m-0">A place to begin.</h1></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-[#dce0d6] px-3.5 py-2.5 text-sm text-[#466358]" data-testid="button-print-report"><Printer size={16}/> Print</button><button onClick={exportReport} className="inline-flex items-center gap-2 rounded-lg border border-[#dce0d6] px-3.5 py-2.5 text-sm text-[#466358]" data-testid="button-export-report"><Download size={16}/> Export</button><button onClick={removeReport} disabled={deletion.isPending} className="inline-flex items-center gap-2 rounded-lg border border-[#ead1c6] px-3.5 py-2.5 text-sm text-[#9a5142] disabled:opacity-50" data-testid="button-delete-report"><Trash2 size={16}/>{deletion.isPending ? 'Deleting…' : 'Delete'}</button></div>
    </div>
    {deletion.isError && <div className="mb-4"><ErrorNotice message="The report could not be deleted. You can safely try again." retry={removeReport}/></div>}
    <section className="panel p-6 md:p-9 mb-6">
      <div className="grid md:grid-cols-[.8fr_1.2fr] gap-8 items-center">
        <div className="flex justify-center"><ScoreMeter score={report.overallScore} level={report.riskLevel}/></div>
        <div><div className="eyebrow mb-3">Your assessment · <time dateTime={report.assessmentDate}>{new Date(report.assessmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</time></div><h2 className="font-display text-[30px] leading-tight tracking-[-.035em] text-[#294f45] m-0">{report.riskLevel === 'LOW' ? 'You have a solid foundation.' : report.riskLevel === 'MODERATE' ? 'A few areas deserve a closer look.' : 'There are practical steps you can take.'}</h2>
          <p className="text-sm leading-6 text-[#6d7e75] mt-3 mb-4">This is an educational estimate based on your self-reported answers. A higher score means more potential exposure in the areas assessed. It cannot predict incidents or guarantee safety.</p>
          <div className="flex flex-wrap gap-4 text-xs text-[#698078]"><span className="inline-flex gap-1.5 items-center"><KeyRound size={14}/> {report.securityControlsEnabled} security controls enabled</span><span className="font-mono">Report ID · {report.assessmentId}</span></div>
        </div>
      </div>
    </section>
    <div className="grid lg:grid-cols-[1fr_.88fr] gap-6 mb-6">
      <section className="panel p-5 md:p-7" aria-labelledby="categories-title">
        <div className="eyebrow mb-2">Where risk may sit</div><h2 id="categories-title" className="font-display text-2xl text-[#294f45] mt-0 mb-5">Category scores</h2>
        {report.categoryScores.length ? <div className="space-y-4">{report.categoryScores.map(({ category, score }) => <div key={category} data-testid={`report-category-${category.toLowerCase().replaceAll(' ', '-')}`}>
          <div className="flex items-center justify-between gap-3 mb-2"><span className="text-sm text-[#506a60]">{category}</span><span className="font-mono text-xs text-[#667d72]">{score} / 100</span></div><div className="risk-bar h-[9px]"><div className="risk-fill" style={{ width: `${score}%`, background: score >= 70 ? '#b76852' : score >= 45 ? '#c6a45f' : '#6f9e7f' }}/></div>
        </div>)}</div> : <div className="rounded-lg bg-[#f3f1e8] p-4 text-sm text-[#74837b]">No category scores were returned for this report.</div>}
      </section>
      <section className="panel p-5 md:p-7" aria-labelledby="findings-title">
        <div className="eyebrow mb-2">Worth knowing</div><h2 id="findings-title" className="font-display text-2xl text-[#294f45] mt-0 mb-5">Key findings</h2>
        {report.findings.length ? <div className="space-y-3">{report.findings.map((finding) => <article key={finding.id} className="rounded-lg bg-[#f4f2e9] p-4" data-testid={`finding-${finding.id}`}>
          <div className="flex justify-between gap-3 items-start"><div><span className="text-[10px] uppercase tracking-[.12em] text-[#8a8b73]">{finding.category}</span><h3 className="text-sm font-semibold text-[#3c5a4f] mt-1 mb-1">{finding.title}</h3></div><RiskPill level={finding.severity}/></div><p className="text-xs leading-5 text-[#718078] m-0">{finding.detail}</p>
        </article>)}</div> : <div className="flex gap-3 items-center rounded-lg bg-[#eaf0e8] p-4 text-sm text-[#496b57]"><CheckCircle2 size={18}/> No findings were returned.</div>}
      </section>
    </div>
    <section className="panel p-5 md:p-7 mb-6" aria-labelledby="next-title">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-5"><div><div className="eyebrow mb-2">The useful part</div><h2 id="next-title" className="font-display text-2xl text-[#294f45] m-0">A few next steps.</h2></div><span className="text-xs text-[#839087]">Choose what feels manageable. Small changes count.</span></div>
      {recs.length ? <div className="grid md:grid-cols-2 gap-3">{recs.map((item) => <article key={item.id} className="rounded-xl border border-[#e5e4da] bg-[#fcfbf6] p-4" data-testid={`recommendation-${item.id}`}>
        <span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-[#3d5b50]">{item.title}</strong><span className="text-[9px] uppercase tracking-[.1em] text-[#9b8050]">{item.priority}</span></span><span className="block text-[11px] text-[#899087] mt-1">{item.category}</span><p className="text-xs leading-5 text-[#6e7e75] mt-1 mb-0">{item.action}</p>
      </article>)}</div> : <div className="rounded-lg bg-[#f3f1e8] p-4 text-sm text-[#74837b]" data-testid="empty-recommendations">No recommendations are available for this assessment.</div>}
    </section>
    <section className="panel p-5 md:p-7 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div><div className="eyebrow mb-2">Try a what-if</div><h2 className="font-display text-2xl text-[#294f45] m-0">Explore potential improvements.</h2><p className="text-xs leading-5 text-[#77867e] mt-2 mb-0 max-w-[560px]">Choose questionnaire areas where you intend to make a change. This framework simulation is not a prediction or a real-world safety guarantee.</p></div>
        <button onClick={runSimulation} disabled={!transientAnswers || selected.length === 0 || simulation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#285548] px-4 py-3 text-sm font-semibold text-white disabled:opacity-45" data-testid="button-run-simulation">{simulation.isPending ? 'Recalculating…' : 'Simulate selected'} <ArrowRight size={15}/></button>
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-x-5 gap-y-1">
        {questions.map((question) => <label key={question.id} className="flex items-start gap-2.5 rounded-md px-2 py-2 text-xs leading-5 text-[#566e63] hover:bg-[#f5f5ee]" data-testid={`simulation-improvement-${question.id}`}>
          <input type="checkbox" checked={selected.includes(question.id)} onChange={(event) => setSelected((old) => event.target.checked ? [...old, question.id] : old.filter((id) => id !== question.id))} className="mt-1 accent-[#315f51]" data-testid={`checkbox-simulation-${question.id}`}/>
          <span>{question.prompt}<span className="block font-mono text-[9px] uppercase tracking-[.08em] text-[#9a8c6a]">{question.id}</span></span>
        </label>)}
      </div>
      {!transientAnswers && <p className="text-xs text-[#92734a] mt-4 mb-0">Simulation is available during the same browser session as your assessment. Your answers are not saved for later simulation.</p>}
      {simulation.isError && <div className="mt-4"><ErrorNotice message="The simulation could not be completed. Try again when the connection is available." retry={runSimulation}/></div>}
      {simulation.data && <SimulationCard result={simulation.data}/>}
    </section>
    <div className="no-print flex flex-wrap items-center justify-between gap-3 text-sm"><Link href="/learn" className="inline-flex items-center gap-2 text-[#315f51] no-underline hover:underline" data-testid="link-report-learn"><BookOpen size={16}/> Learn more about privacy basics <ChevronRight size={14}/></Link><Link href="/assessment" className="inline-flex items-center gap-2 text-[#315f51] no-underline hover:underline" data-testid="link-retake-assessment">Take another assessment <ArrowRight size={15}/></Link></div>
  </main>;
}

function SimulationCard({ result }: { result: SimulationResult }) {
  return <div className="mt-6 rounded-xl border border-[#dfe4d8] bg-[#f5f6ee] p-5" data-testid="simulation-result">
    <div className="flex items-center gap-2 text-sm font-semibold text-[#3c6051]"><TrendingDown size={16}/> Framework simulation</div>
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[['Current score', result.currentScore, result.currentLevel], ['Simulated score', result.simulatedScore, result.simulatedLevel]].map(([label, score, level]) => <div key={String(label)}><div className="text-[11px] text-[#7d8a80]">{label}</div><div className="mt-1 font-mono text-2xl text-[#315649]">{score}<span className="text-xs"> /100</span></div><div className="mt-2"><RiskPill level={level as RiskLevel}/></div></div>)}
      <div><div className="text-[11px] text-[#7d8a80]">Potential reduction</div><div className="mt-1 font-mono text-2xl text-[#315649]">−{result.riskReduction}<span className="text-xs"> points</span></div><div className="mt-2 text-[10px] text-[#829087]">In this model only</div></div>
      <div><div className="text-[11px] text-[#7d8a80]">Categories recalculated</div><div className="mt-1 font-mono text-2xl text-[#315649]">{result.categoryScores.length}</div><div className="mt-2 text-[10px] text-[#829087]">Selected improvements</div></div>
    </div>
    <div className="mt-5 border-t border-[#e0e4d9] pt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">{result.categoryScores.map((row) => <div key={row.category} className="flex justify-between text-xs text-[#657a70]"><span>{row.category}</span><span className="font-mono">{row.score}</span></div>)}</div>
  </div>;
}

const learnSections = [
  { id:'privacy', icon:LockKeyhole, title:'Privacy is about choice', text:'Privacy means having a say in what information is shared, with whom, and in what context. A public profile, a tagged photo, or an old post can each reveal a different piece of a larger picture. You do not need to disappear online to make more deliberate choices.', points:['Review the audience setting before sharing something personal.','Use separate audiences for different kinds of posts when a platform allows it.','Remember that public information can be copied or reshared.'] },
  { id:'security', icon:KeyRound, title:'Security protects access', text:'Privacy settings shape who can see content; security controls help keep other people from taking over your account. Strong, unique passwords and two-step verification add layers between a password leak and an account compromise.', points:['Use a unique password for each account, ideally with a password manager.','Turn on two-step verification and keep recovery options current.','Review signed-in devices and remove sessions you do not recognize.'] },
  { id:'footprint', icon:Fingerprint, title:'Your footprint adds up', text:'A digital footprint includes what you post, what others post about you, and details that can be inferred over time. A single clue may seem harmless; multiple clues can make routines, interests, or relationships easier to guess.', points:['Search your public name or profile occasionally to see what is visible.','Review older posts, public bios, and tagged content.','Avoid sharing travel plans or precise location in real time.'] },
  { id:'engineering', icon:TriangleAlert, title:'Pause on unexpected requests', text:'Social engineering uses trust, urgency, curiosity, or impersonation to persuade someone to reveal information or take an action. A message that seems to come from a friend or a familiar service can still be misleading.', points:['Be cautious with unexpected links, attachments, or urgent requests.','Never share one-time sign-in codes, even with someone claiming to help.','Verify unusual requests using a separate, trusted way to contact the person.'] },
];

function LearnPage() {
  const { data: items, isLoading, isError, refetch } = useGetPrivacyChecklist();
  const [checked, setChecked] = useState<string[]>([]);
  const checklist = items ?? [];
  const downloadChecklist = () => {
    if (!checklist.length) return;
    const body = checklist.map((item) => `□ ${item.label}  —  ${item.category}`).join('\n');
    const url = URL.createObjectURL(new Blob([`STILLWELL · PRIVATE DIGITAL SAFETY CHECKLIST\n\n${body}\n\nEducational guidance only. Not a real-world safety guarantee.`,], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'stillwell-privacy-checklist.txt'; anchor.click(); URL.revokeObjectURL(url);
  };
  return <main className="page-wrap reveal max-w-[1120px]">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8"><div><div className="eyebrow mb-3">Plain language, practical choices</div><h1 className="display-title text-[clamp(38px,5vw,58px)] m-0">Know what to notice.</h1><p className="max-w-[590px] text-sm leading-6 text-[#6b7d74] mt-4 mb-0">No alarmism, no perfect-security promise. A short guide to everyday privacy, account security, and the clues that travel further than you expect.</p></div><div className="no-print flex gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-[#dce0d6] px-4 py-3 text-sm text-[#466358]" data-testid="button-print-checklist"><Printer size={16}/> Print</button><button onClick={downloadChecklist} disabled={!checklist.length || isError} className="inline-flex items-center gap-2 rounded-lg bg-[#285548] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50" data-testid="button-download-checklist"><Download size={16}/> Download checklist</button></div></div>
    <div className="grid lg:grid-cols-[1fr_340px] gap-7">
      <section className="panel px-5 md:px-8 py-3" aria-label="Privacy and safety learning guide">
        {learnSections.map(({id, icon: Icon, title, text, points}) => <article key={id} id={id} className="learn-article" data-testid={`article-${id}`}>
          <div className="flex gap-3 items-start"><span className="w-9 h-9 rounded-full bg-[#e8eee5] text-[#47705c] grid place-items-center shrink-0"><Icon size={17}/></span><div><h2 className="font-display text-[22px] text-[#294f45] mt-0 mb-2">{title}</h2><p className="text-sm leading-6 text-[#6e7e75] mt-0 mb-3">{text}</p><ul className="space-y-2 pl-4 m-0 text-xs leading-5 text-[#536c60]">{points.map((point) => <li key={point}>{point}</li>)}</ul></div></div>
        </article>)}
      </section>
      <aside className="space-y-5">
        <section className="panel p-5 md:p-6"><div className="flex items-center justify-between gap-2"><div><div className="eyebrow mb-2">Keep close</div><h2 className="font-display text-xl text-[#294f45] m-0">A simple checklist</h2></div><FileText size={20} className="text-[#9d8453]"/></div>
          {isLoading ? <div className="space-y-3 mt-5 animate-pulse" data-testid="status-checklist-loading"><div className="h-9 rounded bg-[#efeee7]"/><div className="h-9 rounded bg-[#efeee7]"/><div className="h-9 rounded bg-[#efeee7]"/></div> : isError ? <div className="mt-4"><ErrorNotice message="Checklist items could not be loaded." retry={() => { void refetch(); }}/></div> :
            checklist.length ? <div className="mt-4">{checklist.map((item: ChecklistItem) => <label key={item.id} className="check-row cursor-pointer" data-testid={`checklist-item-${item.id}`}><input type="checkbox" checked={checked.includes(item.id)} onChange={(event) => setChecked((old) => event.target.checked ? [...old, item.id] : old.filter((id) => id !== item.id))} data-testid={`checkbox-checklist-${item.id}`}/><span><span className="block text-xs leading-5 text-[#526b60]">{item.label}</span><span className="block mt-1 text-[9px] uppercase tracking-[.1em] text-[#9a8a68]">{item.category}</span></span></label>)}</div> :
              <div className="mt-4 space-y-3 text-xs leading-5 text-[#63776d]" data-testid="static-checklist">
                {['Review your audience and profile visibility.', 'Use unique passwords and enable two-step verification.', 'Check active sessions and connected apps.', 'Review location sharing, tags, and older posts.', 'Pause and verify unusual requests.'].map((line) => <label className="check-row cursor-pointer" key={line}><input type="checkbox" data-testid={`checkbox-static-${line.slice(0,8).replaceAll(' ','-')}`}/><span>{line}</span></label>)}
              </div>}
          <div className="mt-5 rounded-lg bg-[#f2f0e6] p-3 text-[11px] leading-5 text-[#78857c]">Checked items are not saved. This checklist is a prompt for your own review.</div>
          {checklist.length > 0 && <button onClick={downloadChecklist} className="no-print mt-4 inline-flex gap-2 items-center text-xs font-semibold text-[#315f51]" data-testid="button-download-api-checklist"><Download size={14}/> Download this checklist</button>}
        </section>
        <section className="rounded-xl bg-[#e8ede3] p-5"><div className="flex gap-2 items-center text-[#3f6d58]"><ShieldCheck size={17}/><h2 className="text-sm font-semibold m-0">No monitoring here</h2></div><p className="text-xs leading-5 text-[#64796e] mt-3 mb-0">This guide does not connect to social accounts, search for people, inspect private content, or collect identifying information.</p></section>
      </aside>
    </div>
    <div className="mt-7 rounded-xl border border-[#deded3] bg-[#f4f2e8] p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><div className="eyebrow mb-2">Want a personal check-in?</div><p className="text-sm text-[#51695e] m-0">Answer questions about your own habits. No account details needed.</p></div><Link href="/assessment" className="no-print inline-flex items-center justify-center gap-2 rounded-lg bg-[#285548] px-4 py-3 text-sm font-semibold text-white no-underline" data-testid="link-learn-assessment">Start assessment <ArrowRight size={16}/></Link>
    </div>
    <p className="mt-6 text-center text-[11px] leading-5 text-[#88938a]">Educational guidance only. Your score and this checklist cannot guarantee safety in the real world.</p>
  </main>;
}

function Router() {
  return <RoutedErrorBoundary><AppFrame><Switch>
    <Route path="/" component={Dashboard}/>
    <Route path="/assessment" component={AssessmentPage}/>
    <Route path="/report/:id" component={ReportPage}/>
    <Route path="/learn" component={LearnPage}/>
    <Route component={NotFound}/>
  </Switch></AppFrame></RoutedErrorBoundary>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;
