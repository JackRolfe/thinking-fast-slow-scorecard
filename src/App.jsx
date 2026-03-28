import React, { useState, useEffect, useCallback } from 'react'

// ─── Utilities ───────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Custom hook: useLocalStorage ────────────────────────────────────────────

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore
    }
  }, [key, value])

  return [value, setValue]
}

// ─── Sales Rep Template ───────────────────────────────────────────────────────

const SALES_TEMPLATE = {
  role: 'Sales Representative',
  description: 'From Kahneman\'s "Thinking, Fast and Slow" — a demonstration of structured interviewing',
  traits: [
    {
      name: 'Technical Proficiency',
      description: 'Knowledge and understanding of the product domain',
      questions: [
        'How many years have you worked in this industry?',
        'Describe a technical challenge you solved for a customer.',
        'How do you stay current with developments in the field?',
      ],
    },
    {
      name: 'Engaging Personality',
      description: 'Ability to build rapport and connect with others',
      questions: [
        'How many new professional relationships do you typically build per month?',
        'Describe a time you built rapport with a difficult client.',
        'What networking or social activities do you participate in?',
      ],
    },
    {
      name: 'Reliability',
      description: 'Consistency, punctuality, and follow-through on commitments',
      questions: [
        'Have you ever missed a deadline? What happened?',
        'How did you track and manage your commitments in your last role?',
        'How often were you late to work or meetings in your last job?',
      ],
    },
    {
      name: 'Drive & Initiative',
      description: 'Self-motivation, proactivity, and going beyond what is asked',
      questions: [
        'How many outreach attempts did you typically make per week?',
        'Describe a project or initiative you started without being asked.',
        'What is the most ambitious professional goal you have set and pursued?',
      ],
    },
    {
      name: 'Communication Skills',
      description: 'Clear, persuasive, and effective communication',
      questions: [
        'How often did you present to groups or clients in your last role?',
        'How do you prepare for an important client presentation?',
        'Describe a time you had to deliver difficult news to a client.',
      ],
    },
    {
      name: 'Resilience',
      description: 'Ability to handle rejection, setbacks, and sustained pressure',
      questions: [
        'What was your longest losing streak in sales, and how did you handle it?',
        'Describe the most difficult rejection you experienced professionally.',
        'How do you recover mentally after a big deal falls through?',
      ],
    },
  ],
}

// ─── Score helpers ────────────────────────────────────────────────────────────

const SCORE_LABELS = {
  1: 'Very Weak',
  2: 'Weak',
  3: 'Adequate',
  4: 'Strong',
  5: 'Very Strong',
}

const SCORE_BG = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-amber-500',
  4: 'bg-blue-500',
  5: 'bg-emerald-500',
}

const SCORE_BORDER = {
  1: 'border-red-500',
  2: 'border-orange-500',
  3: 'border-amber-500',
  4: 'border-blue-500',
  5: 'border-emerald-500',
}

const SCORE_TEXT = {
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-amber-600',
  4: 'text-blue-600',
  5: 'text-emerald-600',
}

const SCORE_LIGHT_BG = {
  1: 'bg-red-50',
  2: 'bg-orange-50',
  3: 'bg-amber-50',
  4: 'bg-blue-50',
  5: 'bg-emerald-50',
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary: disabled
      ? 'bg-indigo-300 text-white cursor-not-allowed'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-400',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Step {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ScoreBar({ score, maxScore = 5 }) {
  const pct = (score / maxScore) * 100
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${SCORE_BG[score] || 'bg-slate-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-semibold w-4 text-right ${SCORE_TEXT[score] || 'text-slate-500'}`}>
        {score}
      </span>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ breadcrumbs = [], onNavigate }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => onNavigate('home')}
          className="text-indigo-600 font-bold text-base hover:text-indigo-800 transition-colors"
        >
          Interview Scorecard
        </button>
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <span className="text-slate-400 text-sm">/</span>
            {crumb.onClick ? (
              <button
                onClick={crumb.onClick}
                className="text-slate-600 text-sm hover:text-slate-900 transition-colors truncate max-w-[160px]"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-slate-500 text-sm truncate max-w-[160px]">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </header>
  )
}

// ─── HomeView ─────────────────────────────────────────────────────────────────

function HomeView({ scorecards, evaluations, onNewScorecard, onViewScorecard, onLoadTemplate, onNavigate }) {
  return (
    <>
      <Header onNavigate={onNavigate} />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Quote callout */}
        <Card className="p-5 border-l-4 border-l-indigo-400 bg-indigo-50 border-indigo-200">
          <blockquote className="text-slate-700 italic text-sm leading-relaxed">
            "Whenever we can replace human judgment by a formula, we should at least consider it."
          </blockquote>
          <p className="text-slate-500 text-xs mt-2 font-medium">— Daniel Kahneman, <em>Thinking, Fast and Slow</em></p>
        </Card>

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Scorecards</h1>
            <p className="text-sm text-slate-500 mt-0.5">Structured interview templates for any role</p>
          </div>
          <Button onClick={onNewScorecard}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Scorecard
          </Button>
        </div>

        {/* Scorecard list or empty state */}
        {scorecards.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-slate-800 font-semibold mb-1">No scorecards yet</h2>
            <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
              Start with the classic Kahneman Sales Representative example, or create your own.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={onLoadTemplate} variant="secondary">
                Try Sales Rep Template
              </Button>
              <Button onClick={onNewScorecard}>Create from Scratch</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {scorecards.map((sc) => {
              const evalCount = evaluations.filter((e) => e.scorecardId === sc.id).length
              return (
                <Card
                  key={sc.id}
                  className="p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => onViewScorecard(sc.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {sc.role}
                      </h2>
                      {sc.description && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{sc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{sc.traits.length} traits</span>
                        <span>·</span>
                        <span>{evalCount} {evalCount === 1 ? 'candidate' : 'candidates'}</span>
                        <span>·</span>
                        <span>Created {formatDate(sc.createdAt)}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mt-0.5 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* About section */}
        <Card className="p-5 bg-slate-50 border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">How it works</h3>
          <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>Define 4–6 traits that predict success in the role</li>
            <li>For each candidate, score every trait independently on a 1–5 scale</li>
            <li>The formula (simple sum) produces the final ranking</li>
            <li>Record your gut feeling last — then compare it to the formula</li>
          </ol>
          <p className="text-xs text-slate-400 mt-3">
            Based on research by Paul Meehl and Daniel Kahneman showing that equal-weight formulas consistently outperform unaided clinical judgment.
          </p>
        </Card>
      </main>
    </>
  )
}

// ─── CreateScorecardView ──────────────────────────────────────────────────────

function CreateScorecardView({ onSave, onCancel, onNavigate }) {
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [traits, setTraits] = useState(() =>
    Array.from({ length: 6 }, () => ({
      id: uid(),
      name: '',
      description: '',
      questions: ['', '', ''],
    }))
  )
  const [error, setError] = useState('')

  function loadTemplate() {
    setRole(SALES_TEMPLATE.role)
    setDescription(SALES_TEMPLATE.description)
    setTraits(
      SALES_TEMPLATE.traits.map((t) => ({
        id: uid(),
        name: t.name,
        description: t.description,
        questions: [...t.questions],
      }))
    )
    setError('')
  }

  function updateTrait(index, field, value) {
    setTraits((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function updateQuestion(traitIndex, qIndex, value) {
    setTraits((prev) => {
      const next = [...prev]
      const qs = [...next[traitIndex].questions]
      qs[qIndex] = value
      next[traitIndex] = { ...next[traitIndex], questions: qs }
      return next
    })
  }

  function addQuestion(traitIndex) {
    setTraits((prev) => {
      const next = [...prev]
      next[traitIndex] = {
        ...next[traitIndex],
        questions: [...next[traitIndex].questions, ''],
      }
      return next
    })
  }

  function removeQuestion(traitIndex, qIndex) {
    setTraits((prev) => {
      const next = [...prev]
      const qs = next[traitIndex].questions.filter((_, i) => i !== qIndex)
      next[traitIndex] = { ...next[traitIndex], questions: qs }
      return next
    })
  }

  function addTrait() {
    setTraits((prev) => [
      ...prev,
      { id: uid(), name: '', description: '', questions: ['', '', ''] },
    ])
  }

  function removeTrait(index) {
    setTraits((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    if (!role.trim()) {
      setError('Role name is required.')
      return
    }
    const namedTraits = traits.filter((t) => t.name.trim())
    if (namedTraits.length < 2) {
      setError('At least 2 traits must have names.')
      return
    }
    setError('')
    const scorecard = {
      id: uid(),
      role: role.trim(),
      description: description.trim(),
      traits: namedTraits.map((t) => ({
        id: t.id,
        name: t.name.trim(),
        description: t.description.trim(),
        questions: t.questions.filter((q) => q.trim()).map((q) => q.trim()),
      })),
      createdAt: new Date().toISOString(),
    }
    onSave(scorecard)
  }

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'New Scorecard' }]}
        onNavigate={onNavigate}
      />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">New Scorecard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Define the role and the traits you will evaluate</p>
          </div>
          <Button variant="secondary" onClick={loadTemplate}>
            Load Sales Rep Template
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Role details */}
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Role Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Sales Representative, Software Engineer…"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of the role or context"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        </Card>

        {/* Traits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Traits to Evaluate</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                6 traits recommended — fill in the ones you need, leave others blank to skip
              </p>
            </div>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md">
              {traits.filter((t) => t.name.trim()).length} / {traits.length} named
            </span>
          </div>

          {traits.map((trait, ti) => (
            <Card key={trait.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Trait {ti + 1}
                </span>
                {traits.length > 2 && (
                  <button
                    onClick={() => removeTrait(ti)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    title="Remove trait"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Trait Name</label>
                  <input
                    type="text"
                    value={trait.name}
                    onChange={(e) => updateTrait(ti, 'name', e.target.value)}
                    placeholder="e.g. Resilience"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={trait.description}
                    onChange={(e) => updateTrait(ti, 'description', e.target.value)}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Factual Questions <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="space-y-2">
                  {trait.questions.map((q, qi) => (
                    <div key={qi} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4 text-right flex-shrink-0">{qi + 1}.</span>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => updateQuestion(ti, qi, e.target.value)}
                        placeholder="Ask a factual, observable question"
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      {trait.questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(ti, qi)}
                          className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove question"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addQuestion(ti)}
                  className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  + Add question
                </button>
              </div>
            </Card>
          ))}

          <button
            onClick={addTrait}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
          >
            + Add Another Trait
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Scorecard</Button>
        </div>
      </main>
    </>
  )
}

// ─── ViewScorecardView ────────────────────────────────────────────────────────

function ViewScorecardView({ scorecard, evaluations, onEvaluate, onViewResult, onDelete, onBack, onNavigate }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const maxScore = scorecard.traits.length * 5

  const sorted = [...evaluations]
    .filter((e) => e.scorecardId === scorecard.id)
    .sort((a, b) => b.formulaScore - a.formulaScore)

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Scorecards', onClick: onBack },
          { label: scorecard.role },
        ]}
        onNavigate={onNavigate}
      />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Scorecard header */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{scorecard.role}</h1>
              {scorecard.description && (
                <p className="text-sm text-slate-500 mt-1">{scorecard.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">Created {formatDate(scorecard.createdAt)}</p>
            </div>
            <Button onClick={onEvaluate}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Evaluate Candidate
            </Button>
          </div>

          {/* Traits list */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Traits ({scorecard.traits.length})</p>
            <div className="flex flex-wrap gap-2">
              {scorecard.traits.map((t) => (
                <span key={t.id} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Candidates table */}
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">
            Candidates Evaluated{sorted.length > 0 ? ` (${sorted.length})` : ''}
          </h2>

          {sorted.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-1">No candidates evaluated yet</p>
              <p className="text-slate-400 text-sm mb-4">Start interviewing to see ranked results here</p>
              <Button onClick={onEvaluate}>Evaluate Your First Candidate</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidate</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Formula</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gut</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((ev, i) => (
                    <tr
                      key={ev.id}
                      onClick={() => onViewResult(ev.id)}
                      className="border-b border-slate-100 last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{ev.candidateName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-900">{ev.formulaScore}</span>
                        <span className="text-slate-400 text-xs"> / {maxScore}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {ev.gutScore != null ? ev.gutScore : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs hidden sm:table-cell">
                        {formatDate(ev.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Danger zone */}
        <div className="pt-2 pb-8">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete this scorecard
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-red-700">
                Delete <strong>{scorecard.role}</strong> and all {sorted.length} evaluations? This cannot be undone.
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

// ─── EvaluateView ─────────────────────────────────────────────────────────────

function EvaluateView({ scorecard, onComplete, onCancel, onNavigate }) {
  const traits = scorecard.traits
  // steps: 0 = intro, 1..N = trait scoring, N+1 = gut, N+2 = summary
  const totalSteps = traits.length + 3 // step 0, 1..N, N+1, N+2
  const [step, setStep] = useState(0)
  const [candidateName, setCandidateName] = useState('')
  const [notes, setNotes] = useState('')
  const [traitScores, setTraitScores] = useState({}) // traitId -> score
  const [gutScore, setGutScore] = useState(null)
  const [gutSkipped, setGutSkipped] = useState(false)
  const [nameError, setNameError] = useState('')

  const currentTraitIndex = step - 1
  const currentTrait = traits[currentTraitIndex]
  const isTraitStep = step >= 1 && step <= traits.length
  const isGutStep = step === traits.length + 1
  const isSummaryStep = step === traits.length + 2

  const currentScore = isTraitStep ? traitScores[currentTrait?.id] : null
  const formulaScore = traits.reduce((sum, t) => sum + (traitScores[t.id] || 0), 0)
  const maxScore = traits.length * 5

  function nextStep() {
    if (step === 0) {
      if (!candidateName.trim()) {
        setNameError('Candidate name is required.')
        return
      }
      setNameError('')
    }
    setStep((s) => s + 1)
  }

  function prevStep() {
    setStep((s) => Math.max(0, s - 1))
  }

  function selectScore(score) {
    if (isTraitStep) {
      setTraitScores((prev) => ({ ...prev, [currentTrait.id]: score }))
    }
  }

  function selectGut(score) {
    setGutScore(score)
    setGutSkipped(false)
  }

  function skipGut() {
    setGutScore(null)
    setGutSkipped(true)
    setStep((s) => s + 1)
  }

  function handleSave() {
    const evaluation = {
      id: uid(),
      scorecardId: scorecard.id,
      candidateName: candidateName.trim(),
      notes: notes.trim(),
      traitScores: traits.map((t) => ({ traitId: t.id, score: traitScores[t.id] || 0 })),
      gutScore: gutSkipped ? null : gutScore,
      formulaScore,
      completedAt: new Date().toISOString(),
    }
    onComplete(evaluation)
  }

  const progressCurrent = step
  const progressTotal = totalSteps - 1

  return (
    <>
      <Header
        breadcrumbs={[
          { label: scorecard.role, onClick: onCancel },
          { label: 'Evaluate Candidate' },
        ]}
        onNavigate={onNavigate}
      />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Progress bar */}
        <ProgressBar current={progressCurrent} total={progressTotal} />

        {/* Step 0: Intro */}
        {step === 0 && (
          <Card className="p-6 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900">New Evaluation</h1>
              <p className="text-sm text-slate-500 mt-1">You will score <strong>{traits.length} traits</strong> independently, then record a gut feeling.</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-800 space-y-1.5">
              <p className="font-semibold">How this works</p>
              <ul className="list-disc list-inside space-y-1 text-indigo-700">
                <li>Score each trait in isolation — do not jump ahead</li>
                <li>Base scores on factual evidence, not impressions</li>
                <li>The formula score is simply the sum of all trait scores</li>
                <li>Your gut feeling is recorded last, for comparison only</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Candidate Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => { setCandidateName(e.target.value); setNameError('') }}
                placeholder="Full name"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${nameError ? 'border-red-400' : 'border-slate-300'}`}
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any context about this interview…"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div className="flex justify-between pt-1">
              <Button variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button onClick={nextStep}>Begin Scoring →</Button>
            </div>
          </Card>
        )}

        {/* Steps 1..N: Trait scoring */}
        {isTraitStep && currentTrait && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                Trait {currentTraitIndex + 1} of {traits.length}
              </span>
              <span className="text-xs text-slate-400">{candidateName}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">{currentTrait.name}</h2>
              {currentTrait.description && (
                <p className="text-slate-500 mt-1">{currentTrait.description}</p>
              )}
            </div>

            {currentTrait.questions.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Interview Questions</p>
                <ul className="space-y-2">
                  {currentTrait.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-slate-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Score selector */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Score this trait:</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((s) => {
                  const selected = currentScore === s
                  return (
                    <button
                      key={s}
                      onClick={() => selectScore(s)}
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all
                        ${selected
                          ? `${SCORE_LIGHT_BG[s]} ${SCORE_BORDER[s]}`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className={`text-lg font-bold ${selected ? SCORE_TEXT[s] : 'text-slate-400'}`}>{s}</span>
                      <span className={`text-[10px] font-medium text-center leading-tight ${selected ? SCORE_TEXT[s] : 'text-slate-400'}`}>
                        {SCORE_LABELS[s]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs text-amber-800">
              Score this trait based only on the information above. Avoid being influenced by your overall impression of the candidate.
            </div>

            <div className="flex justify-between pt-1">
              <Button variant="secondary" onClick={prevStep}>← Back</Button>
              <Button onClick={nextStep} disabled={currentScore == null}>
                Next →
              </Button>
            </div>
          </Card>
        )}

        {/* Step N+1: Gut feeling */}
        {isGutStep && (
          <Card className="p-6 space-y-5">
            <div>
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Intuition Check</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Close Your Eyes</h2>
              <p className="text-slate-500 text-sm mt-1">
                You have scored all {traits.length} traits. Now set those scores aside for a moment.
              </p>
            </div>

            {/* Compact score summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your Trait Scores</p>
              {traits.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{t.name}</span>
                  <span className={`font-semibold ${SCORE_TEXT[traitScores[t.id]] || 'text-slate-400'}`}>
                    {traitScores[t.id] ?? '—'}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700">Formula Score</span>
                <span className="text-indigo-700">{formulaScore} / {maxScore}</span>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm text-purple-800">
              <p className="font-semibold mb-1">The Kahneman "Close Your Eyes" step</p>
              <p>Close your eyes and picture this candidate in the role. Forget the numbers — what does your gut tell you about them?</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Your gut feeling (1–5):</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((s) => {
                  const selected = gutScore === s
                  return (
                    <button
                      key={s}
                      onClick={() => selectGut(s)}
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all
                        ${selected
                          ? `${SCORE_LIGHT_BG[s]} ${SCORE_BORDER[s]}`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className={`text-lg font-bold ${selected ? SCORE_TEXT[s] : 'text-slate-400'}`}>{s}</span>
                      <span className={`text-[10px] font-medium text-center leading-tight ${selected ? SCORE_TEXT[s] : 'text-slate-400'}`}>
                        {SCORE_LABELS[s]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <Button variant="secondary" onClick={prevStep}>← Back</Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={skipGut}>Skip</Button>
                <Button onClick={nextStep} disabled={gutScore == null}>
                  Next →
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step N+2: Summary */}
        {isSummaryStep && (
          <Card className="p-6 space-y-5">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Summary</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{candidateName}</h2>
            </div>

            {/* Formula score big display */}
            <div className="flex items-center gap-5 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-700">{formulaScore}</div>
                <div className="text-xs text-indigo-500 mt-0.5">of {maxScore}</div>
                <div className="text-xs font-semibold text-indigo-600 mt-1">Formula Score</div>
              </div>
              {!gutSkipped && gutScore != null && (
                <>
                  <div className="text-slate-300 text-2xl font-light">vs</div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${SCORE_TEXT[gutScore]}`}>{gutScore}</div>
                    <div className="text-xs text-slate-400 mt-0.5">of 5</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">Gut Score</div>
                  </div>
                </>
              )}
              {gutSkipped && (
                <div className="text-sm text-slate-400 italic">Gut feeling skipped</div>
              )}
            </div>

            {/* Trait breakdown */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Trait Breakdown</p>
              <div className="space-y-3">
                {traits.map((t) => (
                  <div key={t.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{t.name}</span>
                      <span className={`font-semibold ${SCORE_TEXT[traitScores[t.id]] || 'text-slate-400'}`}>
                        {SCORE_LABELS[traitScores[t.id]] || '—'}
                      </span>
                    </div>
                    <ScoreBar score={traitScores[t.id] || 0} maxScore={5} />
                  </div>
                ))}
              </div>
            </div>

            {/* Gut vs formula comparison */}
            {!gutSkipped && gutScore != null && (() => {
              const formulaOutOf5 = Math.round((formulaScore / maxScore) * 5)
              const agree = Math.abs(formulaOutOf5 - gutScore) <= 1
              return (
                <div className={`rounded-lg p-4 text-sm border ${agree ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                  {agree
                    ? `Your gut agrees with the formula — both point to a similar assessment of ${candidateName}.`
                    : `Your gut (${gutScore}/5) differs from the formula (${formulaScore}/${maxScore}). Trust the formula — it's more reliable.`
                  }
                </div>
              )
            })()}

            <div className="flex justify-between pt-1">
              <Button variant="secondary" onClick={prevStep}>← Back</Button>
              <Button onClick={handleSave}>Save Evaluation</Button>
            </div>
          </Card>
        )}
      </main>
    </>
  )
}

// ─── ResultView ───────────────────────────────────────────────────────────────

function ResultView({ scorecard, evaluation, onBack, onDelete, onNavigate }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const maxScore = scorecard.traits.length * 5
  const traitMap = Object.fromEntries(scorecard.traits.map((t) => [t.id, t]))

  const formulaOutOf5 = Math.round((evaluation.formulaScore / maxScore) * 5)
  const gutDiff = evaluation.gutScore != null ? evaluation.gutScore - formulaOutOf5 : null
  const agree = gutDiff != null && Math.abs(gutDiff) <= 1

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Scorecards', onClick: () => onNavigate('home') },
          { label: scorecard.role, onClick: onBack },
          { label: evaluation.candidateName },
        ]}
        onNavigate={onNavigate}
      />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Candidate header */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">{scorecard.role}</p>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{evaluation.candidateName}</h1>
              <p className="text-xs text-slate-400 mt-1">Evaluated {formatDate(evaluation.completedAt)}</p>
              {evaluation.notes && (
                <p className="text-sm text-slate-500 mt-2 italic">"{evaluation.notes}"</p>
              )}
            </div>
            {/* Formula score badge */}
            <div className="text-center flex-shrink-0">
              <div className="text-4xl font-bold text-indigo-700">{evaluation.formulaScore}</div>
              <div className="text-xs text-slate-400">of {maxScore}</div>
              <div className="text-xs font-semibold text-indigo-600 mt-0.5">Formula Score</div>
            </div>
          </div>
        </Card>

        {/* Trait breakdown */}
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Trait Breakdown</h2>
          <div className="space-y-4">
            {evaluation.traitScores.map(({ traitId, score }) => {
              const trait = traitMap[traitId]
              if (!trait) return null
              return (
                <div key={traitId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{trait.name}</span>
                      {trait.description && (
                        <span className="text-xs text-slate-400 ml-2">{trait.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-sm font-bold ${SCORE_TEXT[score] || 'text-slate-400'}`}>{score}</span>
                      <span className={`text-xs ${SCORE_TEXT[score] || 'text-slate-400'}`}>{SCORE_LABELS[score]}</span>
                    </div>
                  </div>
                  <ScoreBar score={score} maxScore={5} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Gut vs formula */}
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">Formula vs. Gut</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-indigo-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-indigo-700">{evaluation.formulaScore}</div>
              <div className="text-xs text-indigo-500">of {maxScore} ({formulaOutOf5}/5 equiv.)</div>
              <div className="text-xs font-semibold text-indigo-600 mt-1">Formula</div>
            </div>
            <div className="text-center bg-slate-50 rounded-lg p-4">
              {evaluation.gutScore != null ? (
                <>
                  <div className={`text-3xl font-bold ${SCORE_TEXT[evaluation.gutScore]}`}>
                    {evaluation.gutScore}
                  </div>
                  <div className="text-xs text-slate-400">of 5</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Gut Feeling</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-slate-300">—</div>
                  <div className="text-xs text-slate-400 mt-1">Not recorded</div>
                  <div className="text-xs font-semibold text-slate-400 mt-1">Gut Feeling</div>
                </>
              )}
            </div>
          </div>

          {evaluation.gutScore != null && (
            <div className={`rounded-lg px-4 py-3 text-sm border ${agree ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
              {agree ? (
                <span>Formula and gut agree — both suggest a <strong>{SCORE_LABELS[formulaOutOf5]}</strong> performance level.</span>
              ) : (
                <span>
                  Formula says <strong>{evaluation.formulaScore}/{maxScore}</strong>, your gut said <strong>{evaluation.gutScore}/5</strong>.{' '}
                  <span className="font-semibold">The formula wins</span> — research consistently shows structured scoring outperforms intuition.
                </span>
              )}
            </div>
          )}

          {evaluation.gutScore == null && (
            <p className="text-sm text-slate-400 italic">No gut score was recorded for this evaluation.</p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <Button variant="secondary" onClick={onBack}>← Back to Scorecard</Button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete evaluation
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Are you sure?</span>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

// ─── App (root) ───────────────────────────────────────────────────────────────

export default function App() {
  const [scorecards, setScorecards] = useLocalStorage('scorecards', [])
  const [evaluations, setEvaluations] = useLocalStorage('evaluations', [])

  // View state: 'home' | 'create' | 'view' | 'evaluate' | 'result'
  const [view, setView] = useState('home')
  const [selectedScorecardId, setSelectedScorecardId] = useState(null)
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null)

  const selectedScorecard = scorecards.find((s) => s.id === selectedScorecardId) ?? null
  const selectedEvaluation = evaluations.find((e) => e.id === selectedEvaluationId) ?? null

  function navigate(viewName, opts = {}) {
    setView(viewName)
    if (opts.scorecardId !== undefined) setSelectedScorecardId(opts.scorecardId)
    if (opts.evaluationId !== undefined) setSelectedEvaluationId(opts.evaluationId)
  }

  // ── Home actions ──
  function handleNewScorecard() {
    navigate('create')
  }

  function handleLoadTemplate() {
    const sc = {
      id: uid(),
      role: SALES_TEMPLATE.role,
      description: SALES_TEMPLATE.description,
      traits: SALES_TEMPLATE.traits.map((t) => ({
        id: uid(),
        name: t.name,
        description: t.description,
        questions: [...t.questions],
      })),
      createdAt: new Date().toISOString(),
    }
    setScorecards((prev) => [...prev, sc])
    setSelectedScorecardId(sc.id)
    setView('view')
  }

  function handleViewScorecard(id) {
    navigate('view', { scorecardId: id })
  }

  // ── Create actions ──
  function handleSaveScorecard(sc) {
    setScorecards((prev) => [...prev, sc])
    navigate('view', { scorecardId: sc.id })
  }

  // ── View scorecard actions ──
  function handleEvaluate() {
    navigate('evaluate', { scorecardId: selectedScorecardId })
  }

  function handleDeleteScorecard() {
    setScorecards((prev) => prev.filter((s) => s.id !== selectedScorecardId))
    setEvaluations((prev) => prev.filter((e) => e.scorecardId !== selectedScorecardId))
    navigate('home')
  }

  function handleViewResult(evalId) {
    navigate('result', { scorecardId: selectedScorecardId, evaluationId: evalId })
  }

  // ── Evaluate actions ──
  function handleCompleteEvaluation(evaluation) {
    setEvaluations((prev) => [...prev, evaluation])
    navigate('result', { scorecardId: selectedScorecardId, evaluationId: evaluation.id })
  }

  // ── Result actions ──
  function handleDeleteEvaluation() {
    setEvaluations((prev) => prev.filter((e) => e.id !== selectedEvaluationId))
    navigate('view', { scorecardId: selectedScorecardId })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'home' && (
        <HomeView
          scorecards={scorecards}
          evaluations={evaluations}
          onNewScorecard={handleNewScorecard}
          onViewScorecard={handleViewScorecard}
          onLoadTemplate={handleLoadTemplate}
          onNavigate={(v) => navigate(v)}
        />
      )}

      {view === 'create' && (
        <CreateScorecardView
          onSave={handleSaveScorecard}
          onCancel={() => navigate('home')}
          onNavigate={(v) => navigate(v)}
        />
      )}

      {view === 'view' && selectedScorecard && (
        <ViewScorecardView
          scorecard={selectedScorecard}
          evaluations={evaluations}
          onEvaluate={handleEvaluate}
          onViewResult={handleViewResult}
          onDelete={handleDeleteScorecard}
          onBack={() => navigate('home')}
          onNavigate={(v) => navigate(v)}
        />
      )}

      {view === 'evaluate' && selectedScorecard && (
        <EvaluateView
          scorecard={selectedScorecard}
          onComplete={handleCompleteEvaluation}
          onCancel={() => navigate('view', { scorecardId: selectedScorecardId })}
          onNavigate={(v) => navigate(v)}
        />
      )}

      {view === 'result' && selectedScorecard && selectedEvaluation && (
        <ResultView
          scorecard={selectedScorecard}
          evaluation={selectedEvaluation}
          onBack={() => navigate('view', { scorecardId: selectedScorecardId })}
          onDelete={handleDeleteEvaluation}
          onNavigate={(v) => navigate(v)}
        />
      )}
    </div>
  )
}
