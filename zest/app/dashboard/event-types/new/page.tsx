"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEventTypes } from "@/hooks/useEventTypes";
import { getCurrentUserPlan } from "@/app/actions/admin";
import { effectiveTier, FREE_EVENT_TYPES_LIMIT } from "@/lib/plan";

type QuestionType = "text" | "multiple_choice" | "dropdown";

interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function NewEventTypePage() {
  const router = useRouter();
  const { createEventType, eventTypes } = useEventTypes();

  const { data: planInfo } = useQuery({
    queryKey: ["currentUserPlan"],
    queryFn: () => getCurrentUserPlan(),
  });

  const tier = planInfo
    ? effectiveTier(planInfo.plan, planInfo.trialEndsAt)
    : "free";
  const atLimit =
    tier === "free" && (eventTypes?.length ?? 0) >= FREE_EVENT_TYPES_LIMIT;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState("");

  // Step 2
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  // Step 3
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const slugPreview = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const toggleDay = (idx: number) => {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: generateId(), label: "", type: "text", required: false, options: [""] },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) }
          : q
      )
    );
  };

  const removeOption = (qId: string, idx: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q
      )
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);

    try {
      // Create the event type
      await createEventType({
        name,
        description: description || undefined,
        duration,
        slug: slugPreview,
        isActive: true,
        availability: selectedDays.map((day) => ({
          type: "weekly",
          dayOfWeek: day,
          startTime,
          endTime,
          isAvailable: true,
        })),
        questions: questions.map((q, idx) => ({
          order: idx,
          type: q.type,
          label: q.label,
          required: q.required,
          options: q.options.filter((o) => o.trim() !== ""),
        })),
      });

      router.push("/dashboard/event-types");
    } catch (error) {
      console.error("Failed to create event type:", error);
      alert("Failed to create event type. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canNext1 = name.trim().length > 0;
  const canNext2 = selectedDays.length > 0 && startTime < endTime;

  if (atLimit) {
    return (
      <div className="page">
        <Link href="/dashboard/event-types" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Event Types
        </Link>
        <div className="empty">
          <span className="empty-icon">🔒</span>
          <h2 className="empty-heading">Free plan limit reached</h2>
          <p className="empty-text">
            The free plan includes {FREE_EVENT_TYPES_LIMIT} event type. Upgrade
            to Pro for unlimited event types, custom branding and WhatsApp
            notify.
          </p>
          <Link href="/dashboard/billing" className="btn-new">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link href="/dashboard/event-types" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Event Types
      </Link>

      <div className="header">
        <h1 className="heading">New Event Type</h1>
        <p className="subheading">Set up a new bookable service</p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {["Basics", "Availability", "Questions"].map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div key={label} className="step-wrap">
              <div className={`step-pill ${active ? "step-active" : done ? "step-done" : "step-idle"}`}>
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="step-num">{num}</span>
                )}
                <span className="step-label">{label}</span>
              </div>
              {i < 2 && <div className={`step-line ${done ? "step-line-done" : ""}`} />}
            </div>
          );
        })}
      </div>

      <div className="card">

        {/* STEP 1: Basics */}
        {step === 1 && (
          <div className="form">
            <div className="field">
              <label className="label">Event name <span className="required">*</span></label>
              <input
                className="input"
                placeholder="e.g. Discovery Call"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {name && (
                <p className="hint">
                  Booking link: <span className="hint-slug">zestbook.com/book/{slugPreview || "..."}</span>
                </p>
              )}
            </div>

            <div className="field">
              <label className="label">Duration</label>
              <div className="duration-grid">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`duration-btn ${duration === d ? "duration-active" : ""}`}
                    onClick={() => setDuration(d)}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Description <span className="optional">(optional)</span></label>
              <textarea
                className="input textarea"
                placeholder="Briefly describe what clients can expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="actions">
              <button className="btn-primary" disabled={!canNext1} onClick={() => setStep(2)}>
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Availability */}
        {step === 2 && (
          <div className="form">
            <div className="field">
              <label className="label">Available days</label>
              <div className="days-grid">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    className={`day-btn ${selectedDays.includes(i) ? "day-active" : ""}`}
                    onClick={() => toggleDay(i)}
                    title={DAY_FULL[i]}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="time-row">
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Start time</label>
                <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="time-sep">to</div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label">End time</label>
                <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            {startTime >= endTime && (
              <p className="error-msg">End time must be after start time.</p>
            )}

            <div className="actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" disabled={!canNext2} onClick={() => setStep(3)}>
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Intake Questions */}
        {step === 3 && (
          <div className="form">
            <p className="step3-intro">Add questions clients answer when they book. Leave empty to skip.</p>

            {questions.length === 0 && (
              <div className="no-questions">
                <span>📋</span>
                <p>No questions yet</p>
              </div>
            )}

            <div className="questions-list">
              {questions.map((q, qi) => (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <span className="q-num">Q{qi + 1}</span>
                    <button className="q-remove" onClick={() => removeQuestion(q.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div className="field">
                    <label className="label">Question</label>
                    <input
                      className="input"
                      placeholder="e.g. What is your main goal?"
                      value={q.label}
                      onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                    />
                  </div>

                  <div className="q-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Answer type</label>
                      <select
                        className="input select"
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                      >
                        <option value="text">Text</option>
                        <option value="multiple_choice">Multiple choice</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>
                    <div className="field required-toggle">
                      <label className="label">Required</label>
                      <button
                        type="button"
                        className={`toggle ${q.required ? "toggle-on" : "toggle-off"}`}
                        onClick={() => updateQuestion(q.id, { required: !q.required })}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                  </div>

                  {(q.type === "multiple_choice" || q.type === "dropdown") && (
                    <div className="field">
                      <label className="label">Options</label>
                      <div className="options-list">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="option-row">
                            <input
                              className="input"
                              placeholder={`Option ${oi + 1}`}
                              value={opt}
                              onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            />
                            {q.options.length > 1 && (
                              <button className="opt-remove" onClick={() => removeOption(q.id, oi)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button className="add-option-btn" onClick={() => addOption(q.id)}>+ Add option</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="add-question-btn" onClick={addQuestion}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add question
            </button>

            <div className="actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : "Create event type"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}