"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getEventTypeById } from "@/app/actions/eventTypes";
import { getAvailability } from "@/app/actions/availability";
import { getQuestions } from "@/app/actions/intakeQuestions";
import { useEventTypes } from "@/hooks/useEventTypes";

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

type Tab = "basics" | "availability" | "questions";

function SaveButton({
  tabName,
  saving,
  savedTab,
  onSave,
  disabled,
}: {
  tabName: Tab;
  saving: boolean;
  savedTab: Tab | null;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="btn-primary" disabled={disabled || saving} onClick={onSave}>
      {saving ? <span className="spinner" /> : savedTab === tabName ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved
        </>
      ) : "Save changes"}
    </button>
  );
}

export default function EditEventTypePage() {
  const router = useRouter();
  const params = useParams();
  const eventTypeId = params.id as string;

  const { data: eventType, isLoading: eventTypeLoading } = useQuery({
    queryKey: ["eventType", eventTypeId],
    queryFn: () => getEventTypeById(eventTypeId),
  });

  const { data: availabilityRules } = useQuery({
    queryKey: ["availability", eventTypeId],
    queryFn: () => getAvailability(eventTypeId),
    enabled: !!eventTypeId,
  });

  const { data: intakeQuestions } = useQuery({
    queryKey: ["intakeQuestions", eventTypeId],
    queryFn: () => getQuestions(eventTypeId),
    enabled: !!eventTypeId,
  });

  const { deleteEventType, updateEventTypeFull } = useEventTypes();

  const [tab, setTab] = useState<Tab>("basics");

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [capacity, setCapacity] = useState(1);
  const [reminderHours, setReminderHours] = useState(24);
  const [everyNDays, setEveryNDays] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [questions, setQuestions] = useState<Question[]>([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedTab, setSavedTab] = useState<Tab | null>(null);

  const [prevTypeKey, setPrevTypeKey] = useState<string | null>(null);
  if (eventType && prevTypeKey !== eventType.id) {
    setPrevTypeKey(eventType.id);
    setName(eventType.name);
    setDuration(eventType.duration);
    setDescription(eventType.description || "");
    setActive(eventType.isActive);
    setCapacity(Math.max(1, eventType.capacity || 1));
    setReminderHours(eventType.reminderHours || 24);
  }

  const [prevAvailabilityKey, setPrevAvailabilityKey] = useState<string | null>(null);
  if (availabilityRules && availabilityRules.length > 0 && prevAvailabilityKey !== eventTypeId) {
    setPrevAvailabilityKey(eventTypeId);
    const weeklyRule = availabilityRules.find(r => r.type === "weekly");
    if (weeklyRule) {
      setSelectedDays(weeklyRule.dayOfWeek !== null ? [weeklyRule.dayOfWeek] : []);
      setStartTime(weeklyRule.startTime);
      setEndTime(weeklyRule.endTime);
      setEveryNDays(weeklyRule.everyNDays || 1);
    }
  }

  const [prevQuestionsKey, setPrevQuestionsKey] = useState<string | null>(null);
  if (intakeQuestions && prevQuestionsKey !== eventTypeId) {
    setPrevQuestionsKey(eventTypeId);
    setQuestions(
      intakeQuestions.map(q => ({
        id: q.id,
        label: q.label,
        type: q.type as QuestionType,
        required: q.required,
        options: q.options ? JSON.parse(q.options) : [],
      }))
    );
  }

  const slugPreview = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const toggleDay = (idx: number) => {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { id: generateId(), label: "", type: "text", required: false, options: [""] }]);
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
        q.id === qId ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) } : q
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
    setSaving(true);

    try {
      await updateEventTypeFull({
        id: eventTypeId,
        name,
        duration,
        description: description || undefined,
        slug: slugPreview,
        isActive: active,
        capacity,
        reminderHours,
        availability: selectedDays.map((day) => ({
          type: "weekly",
          dayOfWeek: day,
          everyNDays: everyNDays > 1 ? everyNDays : undefined,
          startTime,
          endTime,
          isAvailable: true,
        })),
        questions: questions.map((q, idx) => ({
          order: idx,
          type: q.type,
          label: q.label,
          required: q.required,
          options: q.options.filter(o => o.trim() !== ""),
        })),
      });

      setSavedTab(tab);
      setTimeout(() => setSavedTab(null), 2500);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEventType(eventTypeId);
      router.push("/dashboard/event-types");
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete event type");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const canSaveAvailability = selectedDays.length > 0 && startTime < endTime;

  if (eventTypeLoading) {
    return <div className="page">Loading...</div>;
  }

  if (!eventType) {
    return <div className="page">Event type not found</div>;
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
        <div className="header-left">
          <h1 className="heading">{name || "Untitled"}</h1>
          <p className="subheading">zestbook.com/book/{slugPreview}</p>
        </div>
        <div className="header-right">
          <div className={`status-badge ${active ? "status-active" : "status-inactive"}`}>
            <span className="status-dot" />
            {active ? "Active" : "Inactive"}
          </div>
          <button className={`toggle ${active ? "toggle-on" : "toggle-off"}`} onClick={() => setActive(!active)}>
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      <div className="tabs">
        {(["basics", "availability", "questions"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">

        {tab === "basics" && (
          <div className="form">
            <div className="field">
              <label className="label">Event name <span className="required">*</span></label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Discovery Call" />
            </div>
            <div className="field">
              <label className="label">Duration</label>
              <div className="duration-grid">
                {DURATION_OPTIONS.map((d) => (
                  <button key={d} type="button" className={`duration-btn ${duration === d ? "duration-active" : ""}`} onClick={() => setDuration(d)}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label">Description <span className="optional">(optional)</span></label>
              <textarea className="input textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="settings-row">
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Spots per slot</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={50}
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(
                      Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                    )
                  }
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Reminder before</label>
                <select
                  className="input select"
                  value={reminderHours}
                  onChange={(e) => setReminderHours(parseInt(e.target.value))}
                >
                  <option value={1}>1 hour</option>
                  <option value={3}>3 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                </select>
              </div>
            </div>
            <div className="actions">
              <button className="btn-danger-ghost" onClick={() => setShowDeleteConfirm(true)}>Delete event type</button>
              <SaveButton tabName="basics" saving={saving} savedTab={savedTab} onSave={handleSave} />
            </div>
          </div>
        )}

        {tab === "availability" && (
          <div className="form">
            <div className="field">
              <label className="label">Available days</label>
              <div className="days-grid">
                {DAYS.map((d, i) => (
                  <button key={d} type="button" className={`day-btn ${selectedDays.includes(i) ? "day-active" : ""}`} onClick={() => toggleDay(i)} title={DAY_FULL[i]}>
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
            {startTime >= endTime && <p className="error-msg">End time must be after start time.</p>}
            <div className="field">
              <label className="label">Repeats</label>
              <div className="repeat-row">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`duration-btn ${everyNDays === n ? "duration-active" : ""}`}
                    onClick={() => setEveryNDays(n)}
                  >
                    {n === 1 ? "Every week" : `Every ${n} weeks`}
                  </button>
                ))}
              </div>
            </div>
            <div className="actions">
              <SaveButton tabName="availability" saving={saving} savedTab={savedTab} onSave={handleSave} disabled={!canSaveAvailability} />
            </div>
          </div>
        )}

        {tab === "questions" && (
          <div className="form">
            <p className="tab-intro">Questions clients answer when they book this event type.</p>
            {questions.length === 0 && (
              <div className="no-questions"><span>📋</span><p>No questions yet</p></div>
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
                    <input className="input" placeholder="e.g. What is your main goal?" value={q.label} onChange={(e) => updateQuestion(q.id, { label: e.target.value })} />
                  </div>
                  <div className="q-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="label">Answer type</label>
                      <select className="input select" value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}>
                        <option value="text">Text</option>
                        <option value="multiple_choice">Multiple choice</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>
                    <div className="field required-toggle">
                      <label className="label">Required</label>
                      <button type="button" className={`toggle ${q.required ? "toggle-on" : "toggle-off"}`} onClick={() => updateQuestion(q.id, { required: !q.required })}>
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
                            <input className="input" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(q.id, oi, e.target.value)} />
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
              <SaveButton tabName="questions" saving={saving} savedTab={savedTab} onSave={handleSave} />
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-heading">Delete event type?</h2>
            <p className="modal-text">This will permanently delete <strong>{name}</strong> and all its bookings. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner spinner-white" /> : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
