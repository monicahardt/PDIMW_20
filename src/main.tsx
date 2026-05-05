import React from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  HelpCircle,
  Moon,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import "./styles.css";

type StepId = "preparation" | "collection" | "dashboard" | "reflection" | "action";
type SleepMode = "poor" | "typical" | "good";
type ViewMode = "simple" | "advanced";
type TestPhase = "experience" | "questionnaire" | "results";
type TimeBlock = "Morning" | "Afternoon" | "Evening" | "Night";
type EventCategory = "study" | "work" | "social" | "recovery";

type EventBlock = {
  day: string;
  block: TimeBlock;
  title: string;
  category: EventCategory;
  minutes: number;
};

type StressCell = {
  day: string;
  block: TimeBlock;
  baseline: number;
  estimate: number;
  eventMinutes: number;
  events: EventBlock[];
  sleepMode: SleepMode;
};

type TimelinePoint = {
  hour: number;
  stress: number;
};

type ReflectionPattern = {
  title: string;
  detail: string;
  icon: React.ElementType;
};

type ActionIdea = {
  title: string;
  detail: string;
};

type SurveyResponse = {
  id: number;
  testedView: ViewMode;
  easyUnderstand: number;
  usefulInfo: number;
  reflectPatterns: number;
  wouldUse: "Yes" | "No";
  preferredVersion: ViewMode;
  comment: string;
};

type SurveyDraft = Omit<SurveyResponse, "id" | "testedView">;

const steps: { id: StepId; label: string }[] = [
  { id: "preparation", label: "Preparation" },
  { id: "collection", label: "Collection" },
  { id: "dashboard", label: "Integration" },
  { id: "reflection", label: "Reflection" },
  { id: "action", label: "Action" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const blocks: TimeBlock[] = ["Morning", "Afternoon", "Evening", "Night"];

const sleepProfiles: Record<
  SleepMode,
  { label: string; score: number; duration: string; modifier: number; note: string }
> = {
  poor: {
    label: "Poor sleep",
    score: 54,
    duration: "5h 42m",
    modifier: 11,
    note: "Short sleep may be associated with higher stress in the next day.",
  },
  typical: {
    label: "Typical sleep",
    score: 72,
    duration: "6h 48m",
    modifier: 2,
    note: "A normal night keeps the estimate close to historic patterns.",
  },
  good: {
    label: "Good sleep",
    score: 86,
    duration: "7h 54m",
    modifier: -7,
    note: "Good recovery appears linked with lower stress in most time blocks.",
  },
};

const baseStress: Record<string, Record<TimeBlock, number>> = {
  Mon: { Morning: 39, Afternoon: 54, Evening: 42, Night: 28 },
  Tue: { Morning: 45, Afternoon: 63, Evening: 48, Night: 31 },
  Wed: { Morning: 52, Afternoon: 70, Evening: 58, Night: 34 },
  Thu: { Morning: 41, Afternoon: 56, Evening: 50, Night: 30 },
  Fri: { Morning: 37, Afternoon: 47, Evening: 36, Night: 26 },
  Sat: { Morning: 29, Afternoon: 34, Evening: 39, Night: 25 },
  Sun: { Morning: 30, Afternoon: 38, Evening: 44, Night: 29 },
};

const eventBlocks: EventBlock[] = [
  { day: "Mon", block: "Afternoon", title: "Group work", category: "study", minutes: 150 },
  { day: "Tue", block: "Afternoon", title: "Work shift", category: "work", minutes: 240 },
  { day: "Wed", block: "Morning", title: "Lecture block", category: "study", minutes: 180 },
  { day: "Wed", block: "Afternoon", title: "Project deadline", category: "study", minutes: 210 },
  { day: "Thu", block: "Evening", title: "Work shift", category: "work", minutes: 180 },
  { day: "Fri", block: "Afternoon", title: "Reading session", category: "study", minutes: 90 },
  { day: "Sat", block: "Evening", title: "Friends", category: "social", minutes: 180 },
  { day: "Sun", block: "Afternoon", title: "Recovery window", category: "recovery", minutes: 150 },
];

const categoryLabels: Record<EventCategory, string> = {
  study: "Study",
  work: "Work",
  social: "Social",
  recovery: "Recovery",
};

const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));

const emptySurveyDraft: SurveyDraft = {
  easyUnderstand: 0,
  usefulInfo: 0,
  reflectPatterns: 0,
  wouldUse: "Yes",
  preferredVersion: "simple",
  comment: "",
};

function buildStressCells(sleepMode: SleepMode): StressCell[] {
  return days.flatMap((day) =>
    blocks.map((block) => {
      const events = eventBlocks.filter((event) => event.day === day && event.block === block);
      const eventMinutes = events.reduce((sum, event) => sum + event.minutes, 0);
      const loadImpact = eventMinutes >= 210 ? 13 : eventMinutes >= 150 ? 9 : eventMinutes >= 90 ? 5 : 0;
      const recoveryImpact = events.some((event) => event.category === "recovery") ? -8 : 0;
      const estimate = clamp(
        8,
        Math.round(baseStress[day][block] + sleepProfiles[sleepMode].modifier + loadImpact + recoveryImpact),
        96,
      );

      return {
        day,
        block,
        baseline: baseStress[day][block],
        estimate,
        eventMinutes,
        events,
        sleepMode,
      };
    }),
  );
}

function stressLevel(value: number) {
  if (value >= 76) return "High";
  if (value >= 56) return "Medium";
  if (value >= 36) return "Low";
  return "Rest";
}

function stressClass(value: number) {
  if (value >= 76) return "risk-high";
  if (value >= 56) return "risk-medium";
  if (value >= 36) return "risk-low";
  return "risk-rest";
}

function blockHour(block: TimeBlock) {
  return block === "Morning" ? 9 : block === "Afternoon" ? 14 : block === "Evening" ? 19 : 23;
}

function buildTimeline(cell: StressCell): TimelinePoint[] {
  const eventBoost = cell.eventMinutes >= 210 ? 14 : cell.eventMinutes >= 150 ? 10 : cell.eventMinutes >= 90 ? 6 : 0;
  const center = blockHour(cell.block);

  return Array.from({ length: 24 }, (_, hour) => {
    const dayCurve = 8 * Math.sin((Math.PI * (hour - 8)) / 12);
    const sleepCurve = cell.sleepMode === "poor" && hour < 12 ? 7 : cell.sleepMode === "good" ? -4 : 0;
    const eventCurve = eventBoost * Math.exp(-Math.pow(hour - center, 2) / 10);
    const nightDrop = hour < 6 || hour > 22 ? -9 : 0;
    return {
      hour,
      stress: clamp(6, Math.round(cell.baseline + dayCurve + sleepCurve + eventCurve + nightDrop), 94),
    };
  });
}

function App() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("simple");
  const [phase, setPhase] = React.useState<TestPhase>("experience");
  const [responses, setResponses] = React.useState<SurveyResponse[]>([]);
  const simpleStressCells = React.useMemo(() => buildStressCells("typical"), []);

  const showExperience = (mode = viewMode) => {
    setViewMode(mode);
    setPhase("experience");
  };

  const openQuestionnaire = () => setPhase("questionnaire");

  const submitResponse = (draft: SurveyDraft) => {
    setResponses((current) => [
      ...current,
      {
        ...draft,
        id: Date.now(),
        testedView: viewMode,
      },
    ]);
    setPhase("results");
  };

  return (
    <main className="app-shell">
      <section className="ab-shell" aria-label="A/B usability test">
        <ABHeader
          viewMode={viewMode}
          phase={phase}
          responseCount={responses.length}
          onViewChange={showExperience}
          onQuestionnaire={openQuestionnaire}
          onResults={() => setPhase("results")}
        />

        <div className="ab-content">
          {phase === "experience" && viewMode === "simple" && (
            <SimpleInterface stressCells={simpleStressCells} />
          )}
          {phase === "experience" && viewMode === "advanced" && <ComparableAdvancedInterface />}
          {phase === "questionnaire" && (
            <QuestionnaireScreen
              viewMode={viewMode}
              onSubmit={submitResponse}
              onCancel={() => setPhase("experience")}
            />
          )}
          {phase === "results" && (
            <ResultsScreen
              responses={responses}
              onTrySimple={() => showExperience("simple")}
              onTryAdvanced={() => showExperience("advanced")}
              onAddResponse={() => setPhase("questionnaire")}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function AdvancedInterface() {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [sleepMode, setSleepMode] = React.useState<SleepMode>("typical");
  const stressCells = React.useMemo(() => buildStressCells(sleepMode), [sleepMode]);
  const [selectedKey, setSelectedKey] = React.useState("Wed-Afternoon");
  const [chartModal, setChartModal] = React.useState<string | null>(null);
  const [openPattern, setOpenPattern] = React.useState(0);
  const [selectedAction, setSelectedAction] = React.useState(0);

  const selectedCell = stressCells.find((cell) => `${cell.day}-${cell.block}` === selectedKey) ?? stressCells[0];
  const busiest = [...stressCells].sort((a, b) => b.estimate - a.estimate)[0];
  const calmest = [...stressCells].sort((a, b) => a.estimate - b.estimate)[0];
  const currentStep = steps[stepIndex];

  const next = () => setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  const back = () => setStepIndex((index) => Math.max(index - 1, 0));

  return (
    <>
      <section className="prototype" aria-label="The University Effect prototype">
        <ProgressStepper currentIndex={stepIndex} onJump={setStepIndex} />

        <div className="page-viewport">
          <section className="page-card" key={currentStep.id}>
            {currentStep.id === "preparation" && (
              <PreparationPage sleepMode={sleepMode} onSleepModeChange={setSleepMode} />
            )}
            {currentStep.id === "collection" && (
              <CollectionPage sleepMode={sleepMode} selectedCell={selectedCell} />
            )}
            {currentStep.id === "dashboard" && (
              <DashboardPage
                stressCells={stressCells}
                selectedCell={selectedCell}
                selectedKey={selectedKey}
                onSelect={(cell) => setSelectedKey(`${cell.day}-${cell.block}`)}
                onExplain={setChartModal}
              />
            )}
            {currentStep.id === "reflection" && (
              <ReflectionPage
                selectedCell={selectedCell}
                openPattern={openPattern}
                onTogglePattern={setOpenPattern}
              />
            )}
            {currentStep.id === "action" && (
              <ActionPage
                selectedCell={selectedCell}
                busiest={busiest}
                calmest={calmest}
                sleepMode={sleepMode}
                selectedAction={selectedAction}
                onSelectAction={setSelectedAction}
              />
            )}
          </section>
        </div>

        <FooterNav
          stepIndex={stepIndex}
          totalSteps={steps.length}
          onBack={back}
          onNext={next}
        />
      </section>

      {chartModal && <ChartModal title={chartModal} onClose={() => setChartModal(null)} />}
    </>
  );
}

function ABHeader({
  viewMode,
  phase,
  responseCount,
  onViewChange,
  onQuestionnaire,
  onResults,
}: {
  viewMode: ViewMode;
  phase: TestPhase;
  responseCount: number;
  onViewChange: (mode: ViewMode) => void;
  onQuestionnaire: () => void;
  onResults: () => void;
}) {
  return (
    <header className="ab-topbar">
      <div className="view-toggle" aria-label="Choose interface version">
        <span>View:</span>
        <button
          type="button"
          className={viewMode === "simple" && phase === "experience" ? "active" : ""}
          onClick={() => onViewChange("simple")}
        >
          Simple
        </button>
        <button
          type="button"
          className={viewMode === "advanced" && phase === "experience" ? "active" : ""}
          onClick={() => onViewChange("advanced")}
        >
          Advanced
        </button>
      </div>
      <div className="test-actions">
        <button type="button" className="secondary-button small" onClick={onQuestionnaire}>
          Questionnaire
        </button>
        <button type="button" className="primary-button small" onClick={onResults}>
          Results ({responseCount})
        </button>
      </div>
    </header>
  );
}

function SimpleInterface({ stressCells }: { stressCells: StressCell[] }) {
  const totalCalendarMinutes = eventBlocks.reduce((sum, event) => sum + event.minutes, 0);
  const averageStress = Math.round(
    stressCells.reduce((sum, cell) => sum + cell.estimate, 0) / stressCells.length,
  );

  return (
    <section className="simple-page" aria-label="Simple version">
      <h1>The University Effect</h1>
      <p className="simple-description">A simple weekly summary of student stress data.</p>

      <div className="simple-summary" aria-label="Data summary">
        <SimpleMetric label="Sleep duration" value={sleepProfiles.typical.duration} />
        <SimpleMetric label="Calendar load" value={formatMinutes(totalCalendarMinutes)} />
        <SimpleMetric label="Estimated stress" value={`${averageStress}`} />
      </div>

      <section className="simple-chart" aria-label="Weekly stress heatmap">
        <StaticHeatmapChart stressCells={stressCells} />
      </section>

      <p>Stress varies across the week.</p>
    </section>
  );
}

function ComparableAdvancedInterface() {
  const [selectedKey, setSelectedKey] = React.useState("Wed-Afternoon");
  const stressCells = React.useMemo(() => buildStressCells("typical"), []);
  const selectedCell = stressCells.find((cell) => `${cell.day}-${cell.block}` === selectedKey) ?? stressCells[0];
  const totalCalendarMinutes = eventBlocks.reduce((sum, event) => sum + event.minutes, 0);
  const averageStress = Math.round(
    stressCells.reduce((sum, cell) => sum + cell.estimate, 0) / stressCells.length,
  );

  return (
    <section className="simple-page advanced-comparison-page" aria-label="Advanced version">
      <h1>The University Effect</h1>
      <p className="simple-description">A guided weekly summary of student stress data.</p>

      <div className="simple-summary" aria-label="Data summary">
        <SimpleMetric label="Sleep duration" value={sleepProfiles.typical.duration} />
        <SimpleMetric label="Calendar load" value={formatMinutes(totalCalendarMinutes)} />
        <SimpleMetric label="Estimated stress" value={`${averageStress}`} />
      </div>

      <section className="simple-chart" aria-label="Weekly stress heatmap">
        <InteractiveSimpleHeatmap
          stressCells={stressCells}
          selectedKey={selectedKey}
          onSelect={(cell) => setSelectedKey(`${cell.day}-${cell.block}`)}
        />
      </section>

      <section className="advanced-guidance-grid" aria-label="Selected stress explanation">
        <article className="advanced-guidance-panel">
          <h2>Selected Stress Explanation</h2>
          <InlineTimelineChart cell={selectedCell} />
        </article>
        <article className="advanced-guidance-panel compact">
          <h2>What this suggests</h2>
          <p>
            {selectedCell.day} {selectedCell.block.toLowerCase()} appears higher when calendar load and
            sleep context are considered.
          </p>
          <h2>Possible action</h2>
          <p>{guidedActionText(selectedCell)}</p>
        </article>
      </section>
    </section>
  );
}

function SimpleMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="simple-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function StaticHeatmapChart({ stressCells }: { stressCells: StressCell[] }) {
  return (
    <div className="static-heatmap" role="img" aria-label="Weekly estimated stress heatmap">
      <div />
      {days.map((day) => <span key={day}>{day}</span>)}
      {blocks.map((block) => (
        <React.Fragment key={block}>
          <span className="row-label">{block}</span>
          {days.map((day) => {
            const cell = stressCells.find((item) => item.day === day && item.block === block)!;
            return (
              <div key={`${cell.day}-${cell.block}`} className={stressClass(cell.estimate)}>
                {cell.estimate}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function InteractiveSimpleHeatmap({
  stressCells,
  selectedKey,
  onSelect,
}: {
  stressCells: StressCell[];
  selectedKey: string;
  onSelect: (cell: StressCell) => void;
}) {
  return (
    <div className="static-heatmap interactive" role="grid" aria-label="Weekly estimated stress heatmap">
      <div />
      {days.map((day) => <span key={day}>{day}</span>)}
      {blocks.map((block) => (
        <React.Fragment key={block}>
          <span className="row-label">{block}</span>
          {days.map((day) => {
            const cell = stressCells.find((item) => item.day === day && item.block === block)!;
            const key = `${cell.day}-${cell.block}`;
            return (
              <button
                key={key}
                type="button"
                className={`${stressClass(cell.estimate)} ${selectedKey === key ? "selected" : ""}`}
                onClick={() => onSelect(cell)}
                aria-label={`${day} ${block}: estimated stress ${cell.estimate}`}
              >
                {cell.estimate}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function QuestionnaireScreen({
  viewMode,
  onSubmit,
  onCancel,
}: {
  viewMode: ViewMode;
  onSubmit: (draft: SurveyDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = React.useState<SurveyDraft>({
    ...emptySurveyDraft,
    preferredVersion: viewMode,
  });

  const setRating = (
    field: "easyUnderstand" | "usefulInfo" | "reflectPatterns",
    value: number,
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const ready = draft.easyUnderstand > 0 && draft.usefulInfo > 0 && draft.reflectPatterns > 0;

  return (
    <section className="questionnaire-page" aria-label="Usability questionnaire">
      <div className="questionnaire-card">
        <p className="eyebrow">Usability test</p>
        <h1>Questionnaire for {viewMode === "simple" ? "Simple" : "Advanced"} version</h1>

        <RatingQuestion
          label="Was this interface easy to navigate?"
          value={draft.easyUnderstand}
          onChange={(value) => setRating("easyUnderstand", value)}
        />
        <RatingQuestion
          label="Was it easy to understand the stress pattern?"
          value={draft.usefulInfo}
          onChange={(value) => setRating("usefulInfo", value)}
        />
        <RatingQuestion
          label="Did this help you reflect on stress patterns?"
          value={draft.reflectPatterns}
          onChange={(value) => setRating("reflectPatterns", value)}
        />

        <ChoiceQuestion
          label="Could you take action from this interface?"
          options={["Yes", "No"]}
          value={draft.wouldUse}
          onChange={(value) => setDraft((current) => ({ ...current, wouldUse: value as "Yes" | "No" }))}
        />

        <ChoiceQuestion
          label="Which version did you prefer?"
          options={["Simple", "Advanced"]}
          value={draft.preferredVersion === "simple" ? "Simple" : "Advanced"}
          onChange={(value) =>
            setDraft((current) => ({
              ...current,
              preferredVersion: value === "Simple" ? "simple" : "advanced",
            }))
          }
        />

        <label className="open-question">
          <span>What was useful or confusing?</span>
          <textarea
            value={draft.comment}
            onChange={(event) => setDraft((current) => ({ ...current, comment: event.target.value }))}
            rows={3}
          />
        </label>

        <div className="questionnaire-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Back to interface
          </button>
          <button type="button" className="primary-button" onClick={() => onSubmit(draft)} disabled={!ready}>
            Submit response
          </button>
        </div>
      </div>
    </section>
  );
}

function RatingQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="survey-question">
      <legend>{label}</legend>
      <div className="rating-scale">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            className={value === score ? "active" : ""}
            onClick={() => onChange(score)}
            aria-pressed={value === score}
          >
            {score}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ChoiceQuestion({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="survey-question">
      <legend>{label}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "active" : ""}
            onClick={() => onChange(option)}
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ResultsScreen({
  responses,
  onTrySimple,
  onTryAdvanced,
  onAddResponse,
}: {
  responses: SurveyResponse[];
  onTrySimple: () => void;
  onTryAdvanced: () => void;
  onAddResponse: () => void;
}) {
  const simpleStats = surveyStats(responses, "simple");
  const advancedStats = surveyStats(responses, "advanced");
  const simplePreference = responses.filter((response) => response.preferredVersion === "simple").length;
  const advancedPreference = responses.filter((response) => response.preferredVersion === "advanced").length;

  return (
    <section className="results-page" aria-label="Usability test results">
      <div className="results-card">
        <p className="eyebrow">A/B usability test</p>
        <h1>Results from participants</h1>

        {responses.length === 0 ? (
          <p className="empty-results">No participant responses yet.</p>
        ) : (
          <>
            <div className="results-grid">
              <ResultBlock title="Simple" stats={simpleStats} />
              <ResultBlock title="Advanced" stats={advancedStats} />
            </div>
            <div className="preference-summary">
              <span>Preferred Simple: <strong>{simplePreference}</strong></span>
              <span>Preferred Advanced: <strong>{advancedPreference}</strong></span>
            </div>
          </>
        )}

        <div className="questionnaire-actions">
          <button type="button" className="secondary-button" onClick={onTrySimple}>
            Try Simple Version
          </button>
          <button type="button" className="secondary-button" onClick={onTryAdvanced}>
            Try Advanced Version
          </button>
          <button type="button" className="primary-button" onClick={onAddResponse}>
            Add response
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultBlock({ title, stats }: { title: string; stats: ReturnType<typeof surveyStats> }) {
  return (
    <article className="result-block">
      <h2>{title}</h2>
      <dl>
        <div>
          <dt>Responses</dt>
          <dd>{stats.count}</dd>
        </div>
        <div>
          <dt>Easy to navigate</dt>
          <dd>{stats.easyUnderstand}</dd>
        </div>
        <div>
          <dt>Understand stress</dt>
          <dd>{stats.usefulInfo}</dd>
        </div>
        <div>
          <dt>Reflect on stress</dt>
          <dd>{stats.reflectPatterns}</dd>
        </div>
        <div>
          <dt>Could take action</dt>
          <dd>{stats.wouldUseYes}</dd>
        </div>
      </dl>
    </article>
  );
}

function ProgressStepper({
  currentIndex,
  onJump,
}: {
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav className="stepper" aria-label="Prototype steps">
      {steps.map((step, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "next";
        return (
          <button
            key={step.id}
            type="button"
            className={`step ${state}`}
            aria-current={state === "active" ? "step" : undefined}
            onClick={() => onJump(index)}
          >
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
          </button>
        );
      })}
    </nav>
  );
}

function PreparationPage({
  sleepMode,
  onSleepModeChange,
}: {
  sleepMode: SleepMode;
  onSleepModeChange: (mode: SleepMode) => void;
}) {
  return (
    <PageShell
      eyebrow="Preparation"
      title="The University Effect"
      intro="Start by choosing one sleep scenario. The dashboard will use it to show how sleep and student routines may be associated with stress."
    >
      <div className="focus-question">
        <ShieldAlert size={22} aria-hidden="true" />
        <div>
          <strong>Question to explore</strong>
          <p>When does stress appear higher, and what small schedule change could a student try?</p>
        </div>
      </div>

      <SleepSelector sleepMode={sleepMode} onSleepModeChange={onSleepModeChange} />
    </PageShell>
  );
}

function CollectionPage({
  sleepMode,
  selectedCell,
}: {
  sleepMode: SleepMode;
  selectedCell: StressCell;
}) {
  return (
    <PageShell
      eyebrow="Collection"
      title="What data is used?"
      intro="The prototype is based on our group work with one group member's Garmin watch data, sleep records, and calendar events."
    >
      <section className="collection-groups" aria-label="Collected data summary">
        <div>
          <h2>Input data</h2>
          <div className="overview-band two-up">
            <Metric icon={Moon} label="Sleep score" value={`${sleepProfiles[sleepMode].score}`} detail={sleepProfiles[sleepMode].duration} />
            <Metric icon={CalendarDays} label="Calendar load" value={`${selectedCell.eventMinutes}m`} detail={eventSummary(selectedCell)} />
          </div>
        </div>
        <div>
          <h2>Derived context</h2>
          <div className="overview-band two-up">
            <Metric icon={Gauge} label="Stress estimate" value={`${selectedCell.estimate}`} detail={`${stressLevel(selectedCell.estimate)} level`} />
            <Metric icon={Activity} label="Selected block" value={selectedCell.day} detail={selectedCell.block} />
          </div>
        </div>
      </section>

      <div className="data-note">
        <HelpCircle size={20} aria-hidden="true" />
        <p>The full Observable notebook contains the broader Garmin stress, sleep, and calendar processing. This app shows a simplified version of the data to support reflection.</p>
      </div>
    </PageShell>
  );
}

function DashboardPage({
  stressCells,
  selectedCell,
  selectedKey,
  onSelect,
  onExplain,
}: {
  stressCells: StressCell[];
  selectedCell: StressCell;
  selectedKey: string;
  onSelect: (cell: StressCell) => void;
  onExplain: (title: string) => void;
}) {
  return (
    <PageShell
      eyebrow="Integration"
      title="Dashboard"
      intro="Two Observable-inspired views show the main stress pattern and the selected stress explanation."
      compact
    >
      <section className="dashboard-grid">
        <ObservablePanel
          title="Observable Chart - Weekly Stress Heatmap"
          subtitle="Shows estimated stress across weekdays and time blocks."
          kind="heatmap"
          stressCells={stressCells}
          selectedCell={selectedCell}
          selectedKey={selectedKey}
          onSelect={onSelect}
          onExplain={() => onExplain("Weekly stress heatmap")}
        />
        <ObservablePanel
          title="Observable Chart - Selected Stress Explanation"
          subtitle="Shows the selected time block together with sleep and calendar context."
          kind="timeline"
          selectedCell={selectedCell}
          onExplain={() => onExplain("Stress timeline")}
        />
      </section>

      <TimeBlockSelector
        stressCells={stressCells}
        selectedKey={selectedKey}
        selectedCell={selectedCell}
        onSelect={onSelect}
      />
      <p className="dashboard-helper">
        Selected block: <strong>{selectedCell.day} {selectedCell.block.toLowerCase()}</strong>. Tap Explain to understand why this block may be higher.
      </p>
    </PageShell>
  );
}

function ReflectionPage({
  selectedCell,
  openPattern,
  onTogglePattern,
}: {
  selectedCell: StressCell;
  openPattern: number;
  onTogglePattern: (index: number) => void;
}) {
  const patterns: ReflectionPattern[] = [
    {
      title: "Stress appears higher after shorter sleep.",
      detail: `With ${sleepProfiles[selectedCell.sleepMode].label.toLowerCase()}, stress appears higher in the selected time block, around ${selectedCell.estimate}. This pattern is useful for reflection, but it does not show cause by itself.`,
      icon: BedDouble,
    },
    {
      title: "Busy afternoons are associated with higher stress.",
      detail: `${selectedCell.day} ${selectedCell.block.toLowerCase()} has ${selectedCell.eventMinutes} minutes of calendar load. Dense blocks may need more buffer.`,
      icon: CalendarDays,
    },
    {
      title: "Lower workload days show better recovery.",
      detail: "Blocks with fewer events often sit closer to rest or low stress. This can help students choose recovery windows.",
      icon: RefreshCw,
    },
  ];

  return (
    <PageShell
      eyebrow="Reflection"
      title="What patterns stand out?"
      intro="Open a card to connect the dashboard to a possible explanation."
    >
      <div className="reflection-list">
        {patterns.map((pattern, index) => (
          <ReflectionCard
            key={pattern.title}
            pattern={pattern}
            open={openPattern === index}
            onClick={() => onTogglePattern(openPattern === index ? -1 : index)}
          />
        ))}
      </div>
    </PageShell>
  );
}

function ActionPage({
  selectedCell,
  busiest,
  calmest,
  sleepMode,
  selectedAction,
  onSelectAction,
}: {
  selectedCell: StressCell;
  busiest: StressCell;
  calmest: StressCell;
  sleepMode: SleepMode;
  selectedAction: number;
  onSelectAction: (index: number) => void;
}) {
  const actions: ActionIdea[] = [
    {
      title: "You could try a lighter study block after short sleep.",
      detail: "Use review or admin tasks when sleep was poor, then check how the day felt.",
    },
    {
      title: "It might help to add short breaks on busy days.",
      detail: "A small buffer around study or work blocks may make stress feel more manageable.",
    },
    {
      title: "Consider adjusting repeated high-stress periods.",
      detail: "Look for one repeated block that can move, shrink, or get a recovery break.",
    },
  ];

  return (
    <PageShell
      eyebrow="Action"
      title={adviceTitle(selectedCell)}
      intro={adviceText(selectedCell, sleepMode)}
    >
      <div className="action-list">
        {actions.map((action, index) => (
          <ActionCard
            key={action.title}
            action={action}
            selected={selectedAction === index}
            onClick={() => onSelectAction(index)}
          />
        ))}
      </div>

      <section className="summary-panel">
        <p>These are suggestions, not instructions.</p>
        <div>
          <span>Highest estimate: <strong>{busiest.day} {busiest.block}</strong></span>
          <span>Calmest block: <strong>{calmest.day} {calmest.block}</strong></span>
        </div>
      </section>
    </PageShell>
  );
}

function PageShell({
  eyebrow,
  title,
  intro,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <>
      <header className={`page-header ${compact ? "compact" : ""}`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className={`page-content ${compact ? "compact" : ""}`}>{children}</div>
    </>
  );
}

function SleepSelector({
  sleepMode,
  onSleepModeChange,
}: {
  sleepMode: SleepMode;
  onSleepModeChange: (mode: SleepMode) => void;
}) {
  return (
    <div className="sleep-control" aria-label="Sleep condition">
      {(Object.keys(sleepProfiles) as SleepMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          className={sleepMode === mode ? "active" : ""}
          onClick={() => onSleepModeChange(mode)}
        >
          <BedDouble size={18} aria-hidden="true" />
          <span>
            <strong>{sleepProfiles[mode].label}</strong>
            <small>{sleepProfiles[mode].duration}</small>
          </span>
        </button>
      ))}
      <p className="sleep-helper">Changing the sleep scenario updates the stress estimate in the prototype.</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="metric">
      <Icon size={20} aria-hidden="true" />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function ObservablePanel({
  title,
  subtitle,
  kind,
  stressCells,
  selectedCell,
  selectedKey,
  onSelect,
  onExplain,
}: {
  title: string;
  subtitle: string;
  kind: "heatmap" | "timeline";
  stressCells?: StressCell[];
  selectedCell: StressCell;
  selectedKey?: string;
  onSelect?: (cell: StressCell) => void;
  onExplain: () => void;
}) {
  return (
    <article className="observable-panel">
      <div className="observable-title">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button type="button" onClick={onExplain}>
          <HelpCircle size={16} aria-hidden="true" />
          Explain
        </button>
      </div>
      <div className="chart-click-layer">
        {kind === "heatmap" && stressCells && selectedKey && onSelect ? (
          <InlineHeatmapChart
            stressCells={stressCells}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        ) : (
          <InlineTimelineChart cell={selectedCell} />
        )}
        <button type="button" className="chart-explain-chip" onClick={onExplain}>
          Tap for explanation
        </button>
      </div>
    </article>
  );
}

function InlineHeatmapChart({
  stressCells,
  selectedKey,
  onSelect,
}: {
  stressCells: StressCell[];
  selectedKey: string;
  onSelect: (cell: StressCell) => void;
}) {
  return (
    <div className="inline-heatmap" role="grid" aria-label="Weekly estimated stress heatmap">
      <div />
      {days.map((day) => <span key={day}>{day}</span>)}
      {blocks.map((block) => (
        <React.Fragment key={block}>
          <span className="row-label">{block}</span>
          {days.map((day) => {
            const cell = stressCells.find((item) => item.day === day && item.block === block)!;
            const key = `${cell.day}-${cell.block}`;
            return (
              <button
                key={key}
                type="button"
                className={`${stressClass(cell.estimate)} ${selectedKey === key ? "selected" : ""}`}
                onClick={() => onSelect(cell)}
                aria-label={`${day} ${block}: estimated stress ${cell.estimate}`}
              >
                <strong>{cell.estimate}</strong>
                <small>{stressLevel(cell.estimate)}</small>
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function InlineTimelineChart({ cell }: { cell: StressCell }) {
  const timeline = buildTimeline(cell);
  const width = 640;
  const height = 240;
  const pad = { top: 22, right: 20, bottom: 34, left: 42 };
  const x = (hour: number) => pad.left + (hour / 23) * (width - pad.left - pad.right);
  const y = (stress: number) => height - pad.bottom - (stress / 100) * (height - pad.top - pad.bottom);
  const points = timeline.map((point) => `${x(point.hour)},${y(point.stress)}`).join(" ");
  const selectedX = x(blockHour(cell.block));

  return (
    <div className="inline-timeline">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily estimated stress timeline">
        {[25, 50, 75].map((value) => (
          <React.Fragment key={value}>
            <line x1={pad.left} x2={width - pad.right} y1={y(value)} y2={y(value)} className="grid-line" />
            <text x={28} y={y(value) + 4} className="axis-text" textAnchor="end">{value}</text>
          </React.Fragment>
        ))}
        <rect
          x={Math.max(pad.left, selectedX - 42)}
          y={pad.top}
          width="84"
          height={height - pad.top - pad.bottom}
          className="event-band"
        />
        <polyline className="stress-line" points={points} />
        {timeline.filter((point) => point.hour % 3 === 0).map((point) => (
          <circle key={point.hour} cx={x(point.hour)} cy={y(point.stress)} r="3.8" className="stress-dot" />
        ))}
        <line x1={selectedX} x2={selectedX} y1={pad.top} y2={height - pad.bottom} className="selected-line" />
        {[0, 6, 12, 18, 23].map((hour) => (
          <text key={hour} x={x(hour)} y={height - 12} className="axis-text" textAnchor="middle">{hour}</text>
        ))}
      </svg>
      <p>
        {cell.day} {cell.block}: estimated stress {cell.estimate}. {eventSummary(cell)} context.
      </p>
    </div>
  );
}

function TimeBlockSelector({
  stressCells,
  selectedKey,
  selectedCell,
  onSelect,
}: {
  stressCells: StressCell[];
  selectedKey: string;
  selectedCell: StressCell;
  onSelect: (cell: StressCell) => void;
}) {
  return (
    <section className="selector-panel">
      <div>
        <h2>Selected time block</h2>
        <p>{selectedCell.day} {selectedCell.block}: estimated stress {selectedCell.estimate}</p>
      </div>
      <div className="mini-heatmap" role="grid" aria-label="Select a time block">
        <div />
        {days.map((day) => <span key={day}>{day}</span>)}
        {blocks.map((block) => (
          <React.Fragment key={block}>
            <span>{block}</span>
            {days.map((day) => {
              const cell = stressCells.find((item) => item.day === day && item.block === block)!;
              const key = `${cell.day}-${cell.block}`;
              return (
                <button
                  key={key}
                  type="button"
                  className={`${stressClass(cell.estimate)} ${selectedKey === key ? "selected" : ""}`}
                  onClick={() => onSelect(cell)}
                  aria-label={`${day} ${block}: estimated stress ${cell.estimate}`}
                >
                  {cell.estimate}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function ReflectionCard({
  pattern,
  open,
  onClick,
}: {
  pattern: ReflectionPattern;
  open: boolean;
  onClick: () => void;
}) {
  const Icon = pattern.icon;
  return (
    <button type="button" className={`reflection-card ${open ? "open" : ""}`} onClick={onClick} aria-expanded={open}>
      <Icon size={21} aria-hidden="true" />
      <span>
        <strong>{pattern.title}</strong>
        {open && <p>{pattern.detail}</p>}
      </span>
    </button>
  );
}

function ActionCard({
  action,
  selected,
  onClick,
}: {
  action: ActionIdea;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`action-card ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}>
      <CheckCircle2 size={20} aria-hidden="true" />
      <span>
        <strong>{action.title}</strong>
        <p>{action.detail}</p>
      </span>
    </button>
  );
}

function FooterNav({
  stepIndex,
  totalSteps,
  onBack,
  onNext,
}: {
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="footer-nav">
      <button type="button" className="secondary-button" onClick={onBack} disabled={stepIndex === 0}>
        <ChevronLeft size={18} aria-hidden="true" />
        Back
      </button>
      <button type="button" className="primary-button" onClick={onNext} disabled={stepIndex === totalSteps - 1}>
        {stepIndex === totalSteps - 1 ? "Done" : "Next"}
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </footer>
  );
}

function ChartModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="chart-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p>
          This chart helps the student compare stress patterns with sleep and calendar context. The wording stays uncertain because these patterns may be associated, but they do not prove cause.
        </p>
        <button type="button" className="primary-button" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

function averageScore(responses: SurveyResponse[], field: "easyUnderstand" | "usefulInfo" | "reflectPatterns") {
  if (responses.length === 0) return "n/a";
  const average = responses.reduce((sum, response) => sum + response[field], 0) / responses.length;
  return average.toFixed(1);
}

function surveyStats(responses: SurveyResponse[], testedView: ViewMode) {
  const filtered = responses.filter((response) => response.testedView === testedView);
  return {
    count: filtered.length,
    easyUnderstand: averageScore(filtered, "easyUnderstand"),
    usefulInfo: averageScore(filtered, "usefulInfo"),
    reflectPatterns: averageScore(filtered, "reflectPatterns"),
    wouldUseYes: filtered.filter((response) => response.wouldUse === "Yes").length,
  };
}

function eventSummary(cell: StressCell) {
  if (cell.events.length === 0) return "No event";
  return cell.events.map((event) => categoryLabels[event.category]).join(" + ");
}

function adviceTitle(cell: StressCell) {
  const level = stressLevel(cell.estimate);
  if (level === "High") return "Consider protecting this time block";
  if (level === "Medium") return "Keep some buffer";
  if (level === "Low") return "Usable focus window";
  return "Good recovery window";
}

function adviceText(cell: StressCell, sleepMode: SleepMode) {
  const hasWorkload = cell.eventMinutes >= 150;
  const sleep = sleepProfiles[sleepMode].label.toLowerCase();

  if (cell.estimate >= 76 && hasWorkload) {
    return `The selected time block, ${cell.day} ${cell.block.toLowerCase()}, combines ${sleep} with a heavy calendar block. Patterns suggest trying a lighter plan here.`;
  }

  if (cell.estimate >= 76) {
    return `${cell.day} ${cell.block.toLowerCase()} appears higher for this sleep condition. Routine work may fit better.`;
  }

  if (cell.estimate >= 56 && hasWorkload) {
    return `${cell.day} ${cell.block.toLowerCase()} looks manageable, but calendar load may be associated with higher stress.`;
  }

  if (cell.estimate >= 36) {
    return `${cell.day} ${cell.block.toLowerCase()} appears usable for focused work. Keep the plan realistic.`;
  }

  return `${cell.day} ${cell.block.toLowerCase()} appears calmer. It may be a useful recovery window.`;
}

function guidedActionText(cell: StressCell) {
  if (cell.estimate >= 76 && cell.eventMinutes >= 150) {
    return "Consider adding a break or moving demanding study work away from this block.";
  }

  if (cell.estimate >= 56) {
    return "Keep this block manageable and avoid adding extra deadlines or meetings here.";
  }

  if (cell.estimate >= 36) {
    return "This may be a reasonable focus block if the plan stays realistic.";
  }

  return "This may be a useful recovery window.";
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
