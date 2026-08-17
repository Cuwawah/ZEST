"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicQuestions } from "@/app/actions/intakeQuestions";

interface IntakeQuestion {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string | null;
}

interface IntakeFormProps {
  eventTypeId: string;
  onSubmit: (data: {
    name: string;
    email: string;
    phone?: string;
    responses: { questionId: string; answer: string }[];
  }) => void;
  isSubmitting?: boolean;
}

export default function IntakeForm({ eventTypeId, onSubmit, isSubmitting }: IntakeFormProps) {
  const { data: questions, isLoading } = useQuery({
    queryKey: ["publicQuestions", eventTypeId],
    queryFn: () => getPublicQuestions(eventTypeId),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (phone.trim()) {
      const digits = phone.replace(/\D/g, "");
      if (!/^[0-9]{10,13}$/.test(digits)) {
        newErrors.phone =
          "Please enter a valid phone number (e.g. 08012345678 or +2348012345678)";
      }
    }

    questions?.forEach((q) => {
      if (q.required && !responses[q.id]?.trim()) {
        newErrors[q.id] = "This question is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    onSubmit({
      name,
      email,
      phone: phone.trim() || undefined,
      responses: formattedResponses,
    });
  };

  const renderQuestion = (question: IntakeQuestion) => {
    const options: string[] = question.options ? JSON.parse(question.options) : [];

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            className="input"
            placeholder="Your answer"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            disabled={isSubmitting}
          />
        );

      case "multiple_choice":
        return (
          <div className="radio-group">
            {options.map((opt, idx) => (
              <label key={idx} className="radio-label">
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={responses[question.id] === opt}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  disabled={isSubmitting}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <select
            className="input select"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Select an option</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="loading">Loading form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="section">
        <h3 className="section-title">Your information</h3>

        <div className="field">
          <label className="label">
            Your name <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.name ? "error" : ""}`}
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="field">
          <label className="label">
            Email address <span className="required">*</span>
          </label>
          <input
            type="email"
            className={`input ${errors.email ? "error" : ""}`}
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="label">Phone (WhatsApp)</label>
          <input
            type="tel"
            className={`input ${errors.phone ? "error" : ""}`}
            placeholder="08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>
      </div>

      {questions && questions.length > 0 && (
        <div className="section">
          <h3 className="section-title">Additional information</h3>

          {questions.map((question) => (
            <div key={question.id} className="field">
              <label className="label">
                {question.label}
                {question.required && <span className="required">*</span>}
              </label>
              {renderQuestion(question)}
              {errors[question.id] && (
                <p className="error-text">{errors[question.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner" />
            Confirming...
          </>
        ) : (
          "Confirm booking"
        )}
      </button>

      <style jsx>{`
        .form { max-width: 600px; margin: 0 auto; }
        .section { margin-bottom: 32px; }
        .section-title {
          font-family: "Fraunces", serif;
          font-size: 18px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 20px;
          padding-bottom: 8px;
          border-bottom: 1.5px solid #e8e4cc;
        }
        .field { margin-bottom: 20px; }
        .label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3a3a28;
          margin-bottom: 8px;
        }
        .required { color: #e05555; margin-left: 4px; }
        .input {
          width: 100%;
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          font-family: "DM Sans", sans-serif;
          color: #1a1a0f;
          outline: none;
          transition: all 0.15s;
          box-sizing: border-box;
        }
        .input:focus { border-color: #f5c518; box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.18); }
        .input.error { border-color: #e05555; }
        .input.error:focus { box-shadow: 0 0 0 3px rgba(224, 85, 85, 0.18); }
        .input:disabled { background: #f5f3e8; color: #a0a080; cursor: not-allowed; }
        .textarea { resize: vertical; min-height: 100px; }
        .select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7a60' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .radio-group, .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
        .radio-label, .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #1a1a0f;
          cursor: pointer;
        }
        .radio-label input, .checkbox-label input { width: 16px; height: 16px; cursor: pointer; }
        .radio-label input:disabled, .checkbox-label input:disabled { opacity: 0.5; cursor: not-allowed; }
        .radio-label span, .checkbox-label span { line-height: 1.4; }
        .error-text { font-size: 12px; color: #e05555; margin-top: 4px; }
        .submit-btn {
          width: 100%;
          background: var(--brand-accent, #f5c518);
          color: #1a1a0f;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 500;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 16px;
        }
        .submit-btn:hover:not(:disabled) {
          filter: brightness(0.94);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(26, 26, 15, 0.2);
          border-top-color: #1a1a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading { text-align: center; padding: 60px; color: #7a7a60; font-size: 14px; }
      `}</style>
    </form>
  );
}
