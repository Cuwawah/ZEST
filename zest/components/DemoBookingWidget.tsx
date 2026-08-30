"use client";

import { useState } from "react";

type Step = "time" | "form" | "confirmation";

const TIME_SLOTS: Record<string, string[]> = {
  "0": ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
  "1": ["9:00 AM", "10:00 AM", "10:30 AM", "11:00 AM", "2:30 PM", "3:00 PM", "3:30 PM"],
  "2": ["9:30 AM", "10:00 AM", "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM"],
  "3": ["9:00 AM", "9:30 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM"],
  "4": ["10:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM"],
  "5": ["9:00 AM", "10:00 AM", "2:00 PM"],
  "6": ["10:00 AM", "11:00 AM"],
};

const SPOTS_LEFT: Record<string, Record<string, number>> = {
  "0": { "10:00 AM": 1, "2:00 PM": 2 },
  "1": { "11:00 AM": 1 },
  "2": { "9:30 AM": 2, "3:00 PM": 1 },
  "4": { "10:30 AM": 1 },
  "6": { "10:00 AM": 1 },
};

function getNext7Days() {
  const days: { label: string; dayNum: number; month: string; dayIndex: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      dayIndex: d.getDay(),
    });
  }
  return days;
}

function formatConfirmationDate(dayLabel: string, dayNum: number, month: string, time: string) {
  return `${dayLabel}, ${month} ${dayNum} at ${time}`;
}

export default function DemoBookingWidget() {
  const days = getNext7Days();
  const [step, setStep] = useState<Step>("time");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDayData = days[selectedDay];
  const daySlots = TIME_SLOTS[String(selectedDay)] || [];
  const spots = SPOTS_LEFT[String(selectedDay)] || {};

  const handleTimeContinue = () => {
    if (selectedTime) setStep("form");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email";
    if (phone.trim() && !/^[0-9]{10,13}$/.test(phone.replace(/\D/g, "")))
      e.phone = "Please enter a valid phone number";
    if (!question1.trim()) e.question1 = "This question is required";
    if (!question2.trim()) e.question2 = "Please select an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFormSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setStep("confirmation");
  };

  const handleReset = () => {
    setStep("time");
    setSelectedTime(null);
    setName("");
    setEmail("");
    setPhone("");
    setQuestion1("");
    setQuestion2("");
    setErrors({});
  };

  const handleWhatsApp = () => {
    const msg = `Hi! I just booked a Consultation on Zest for ${formatConfirmationDate(selectedDayData.label, selectedDayData.dayNum, selectedDayData.month, selectedTime!)}. Looking forward to it!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="dw">
      {step === "time" && (
        <>
          <div className="dw-card">
            <div className="dw-card-header">
              <div className="dw-avatar">C</div>
              <div>
                <div className="dw-name">Zest Demo</div>
                <div className="dw-sub">Sample Consultation</div>
              </div>
            </div>
            <div className="dw-meta">
              <span className="dw-badge">30 min</span>
              <span className="dw-badge">Online</span>
            </div>
          </div>

          <div className="dw-picker">
            <div className="dw-date-scroller">
              {days.map((day, i) => (
                <button
                  key={i}
                  className={`dw-date-btn ${selectedDay === i ? "selected" : ""}`}
                  onClick={() => { setSelectedDay(i); setSelectedTime(null); }}
                >
                  <span className="dw-date-day">{day.label}</span>
                  <span className="dw-date-num">{day.dayNum}</span>
                  <span className="dw-date-month">{day.month}</span>
                </button>
              ))}
            </div>

            <div className="dw-slots-box">
              <h3 className="dw-slots-title">
                Available times for {selectedDayData.label}, {selectedDayData.month} {selectedDayData.dayNum}
              </h3>
              <div className="dw-slots-grid">
                {daySlots.map((time) => (
                  <button
                    key={time}
                    className={`dw-slot-btn ${selectedTime === time ? "selected" : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                    {spots[time] && (
                      <span className="dw-spots">{spots[time] === 1 ? "1 left" : `${spots[time]} left`}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className="dw-continue"
            disabled={!selectedTime}
            onClick={handleTimeContinue}
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </>
      )}

      {step === "form" && (
        <form onSubmit={handleFormSubmit} className="dw-form">
          <div className="dw-selected-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {formatConfirmationDate(selectedDayData.label, selectedDayData.dayNum, selectedDayData.month, selectedTime!)}
          </div>

          <div className="dw-section">
            <h3 className="dw-section-title">Your information</h3>

            <div className="dw-field">
              <label className="dw-label">Your name <span className="dw-required">*</span></label>
              <input
                type="text"
                className={`dw-input ${errors.name ? "error" : ""}`}
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="dw-error">{errors.name}</p>}
            </div>

            <div className="dw-field">
              <label className="dw-label">Email address <span className="dw-required">*</span></label>
              <input
                type="email"
                className={`dw-input ${errors.email ? "error" : ""}`}
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="dw-error">{errors.email}</p>}
            </div>

            <div className="dw-field">
              <label className="dw-label">Phone (WhatsApp)</label>
              <input
                type="tel"
                className={`dw-input ${errors.phone ? "error" : ""}`}
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="dw-error">{errors.phone}</p>}
            </div>
          </div>

          <div className="dw-section">
            <h3 className="dw-section-title">Additional information</h3>

            <div className="dw-field">
              <label className="dw-label">What do you need help with? <span className="dw-required">*</span></label>
              <input
                type="text"
                className={`dw-input ${errors.question1 ? "error" : ""}`}
                placeholder="Your answer"
                value={question1}
                onChange={(e) => setQuestion1(e.target.value)}
              />
              {errors.question1 && <p className="dw-error">{errors.question1}</p>}
            </div>

            <div className="dw-field">
              <label className="dw-label">How did you hear about us? <span className="dw-required">*</span></label>
              <div className="dw-radio-group">
                {["Instagram", "WhatsApp", "Friend", "Other"].map((opt) => (
                  <label key={opt} className="dw-radio-label">
                    <input
                      type="radio"
                      name="hearAbout"
                      value={opt}
                      checked={question2 === opt}
                      onChange={(e) => setQuestion2(e.target.value)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              {errors.question2 && <p className="dw-error">{errors.question2}</p>}
            </div>
          </div>

          <button type="submit" className="dw-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="dw-spinner" /> Confirming...</>
            ) : (
              "Confirm booking"
            )}
          </button>

          <button type="button" className="dw-back-link" onClick={() => setStep("time")}>
            ← Back to time selection
          </button>
        </form>
      )}

      {step === "confirmation" && (
        <div className="dw-confirmation">
          <div className="dw-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 className="dw-confirm-title">You&apos;re booked!</h3>
          <p className="dw-confirm-sub">
            Your <strong>Consultation</strong> has been scheduled.
          </p>

          <div className="dw-confirm-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {formatConfirmationDate(selectedDayData.label, selectedDayData.dayNum, selectedDayData.month, selectedTime!)}
          </div>

          <p className="dw-confirm-note">
            Your booking is confirmed. Send the details to the host on WhatsApp to confirm.
          </p>

          <button className="dw-whatsapp-btn" onClick={handleWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send on WhatsApp
          </button>

          <button className="dw-reset-link" onClick={handleReset}>
            Book another time →
          </button>
        </div>
      )}

      <style jsx>{`
        .dw {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dw-card {
          background: #fffbf0;
          border: 1.5px solid #f0ead8;
          border-radius: 18px;
          padding: 20px;
        }

        .dw-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dw-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f5c518;
          color: #1a1a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-fraunces), serif;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
        }

        .dw-name {
          font-weight: 600;
          font-size: 15px;
          color: #1a1a0f;
        }

        .dw-sub {
          font-size: 13px;
          color: #7a7a60;
        }

        .dw-meta {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .dw-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #3a3a28;
          background: #f5f3e8;
          padding: 5px 10px;
          border-radius: 8px;
        }

        .dw-picker {
          background: #fffbf0;
          border: 1.5px solid #f0ead8;
          border-radius: 18px;
          padding: 20px;
        }

        .dw-date-scroller {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 14px;
          margin-bottom: 16px;
          scrollbar-width: thin;
        }

        .dw-date-scroller::-webkit-scrollbar { height: 4px; }
        .dw-date-scroller::-webkit-scrollbar-thumb { background: #e8e4cc; border-radius: 4px; }

        .dw-date-btn {
          min-width: 62px;
          padding: 10px 6px;
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: "DM Sans", sans-serif;
        }

        .dw-date-btn:hover { border-color: #f5c518; background: rgba(245, 197, 24, 0.04); }
        .dw-date-btn.selected { background: #f5c518; border-color: #f5c518; }

        .dw-date-day { font-size: 11px; font-weight: 500; color: #7a7a60; text-transform: uppercase; }
        .dw-date-btn.selected .dw-date-day { color: #1a1a0f; }
        .dw-date-num { font-size: 17px; font-weight: 600; color: #1a1a0f; line-height: 1.2; }
        .dw-date-month { font-size: 11px; color: #a0a080; }
        .dw-date-btn.selected .dw-date-month { color: #1a1a0f; }

        .dw-slots-title {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a0f;
          margin: 0 0 14px;
        }

        .dw-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
          gap: 8px;
        }

        .dw-slot-btn {
          position: relative;
          padding: 11px 8px;
          background: white;
          border: 1.5px solid #e8e4cc;
          border-radius: 10px;
          font-size: 13px;
          font-family: "DM Sans", sans-serif;
          color: #1a1a0f;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }

        .dw-slot-btn:hover { border-color: #f5c518; background: rgba(245, 197, 24, 0.04); transform: translateY(-1px); }
        .dw-slot-btn.selected { background: #f5c518; border-color: #f5c518; font-weight: 500; }

        .dw-spots {
          display: block;
          margin-top: 2px;
          font-size: 10px;
          font-weight: 600;
          color: #b45309;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .dw-slot-btn.selected .dw-spots { color: #1a1a0f; }

        .dw-continue {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #f5c518;
          color: #1a1a0f;
          border: none;
          border-radius: 14px;
          padding: 15px;
          font-size: 15px;
          font-weight: 500;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .dw-continue:hover:not(:disabled) {
          background: #e6b800;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 197, 24, 0.4);
        }

        .dw-continue:disabled { opacity: 0.5; cursor: not-allowed; }

        .dw-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dw-selected-time {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a0f;
        }

        .dw-section {
          background: #fffbf0;
          border: 1.5px solid #f0ead8;
          border-radius: 18px;
          padding: 20px;
        }

        .dw-section-title {
          font-family: var(--font-fraunces), serif;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0 0 18px;
          padding-bottom: 10px;
          border-bottom: 1.5px solid #f0ead8;
        }

        .dw-field { margin-bottom: 16px; }
        .dw-field:last-child { margin-bottom: 0; }

        .dw-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3a3a28;
          margin-bottom: 6px;
        }

        .dw-required { color: #e05555; margin-left: 2px; }

        .dw-input {
          width: 100%;
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: "DM Sans", sans-serif;
          color: #1a1a0f;
          outline: none;
          transition: all 0.15s;
          box-sizing: border-box;
        }

        .dw-input:focus { border-color: #f5c518; box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.18); }
        .dw-input.error { border-color: #e05555; }

        .dw-radio-group { display: flex; flex-direction: column; gap: 8px; }

        .dw-radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #1a1a0f;
          cursor: pointer;
        }

        .dw-radio-label input { width: 16px; height: 16px; cursor: pointer; }

        .dw-error { font-size: 12px; color: #e05555; margin-top: 4px; }

        .dw-submit {
          width: 100%;
          background: #f5c518;
          color: #1a1a0f;
          border: none;
          border-radius: 14px;
          padding: 15px;
          font-size: 15px;
          font-weight: 500;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .dw-submit:hover:not(:disabled) {
          filter: brightness(0.94);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 197, 24, 0.38);
        }

        .dw-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .dw-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(26, 26, 15, 0.2);
          border-top-color: #1a1a0f;
          border-radius: 50%;
          animation: dw-spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes dw-spin { to { transform: rotate(360deg); } }

        .dw-back-link {
          background: none;
          border: none;
          color: #7a7a60;
          font-size: 13px;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          text-align: center;
          padding: 4px;
        }

        .dw-back-link:hover { color: #1a1a0f; }

        .dw-confirmation {
          background: #fffbf0;
          border: 1.5px solid #f0ead8;
          border-radius: 18px;
          padding: 40px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .dw-success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .dw-confirm-title {
          font-family: var(--font-fraunces), serif;
          font-size: 22px;
          font-weight: 600;
          color: #1a1a0f;
          margin: 0;
        }

        .dw-confirm-sub {
          font-size: 14px;
          color: #7a7a60;
          margin: 0;
        }

        .dw-confirm-time {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fdfcf5;
          border: 1.5px solid #e8e4cc;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a0f;
          margin: 8px 0;
        }

        .dw-confirm-note {
          font-size: 13px;
          color: #7a7a60;
          margin: 0;
          max-width: 300px;
          line-height: 1.5;
        }

        .dw-whatsapp-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #25d366;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 500;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 4px;
        }

        .dw-whatsapp-btn:hover {
          background: #1da851;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
        }

        .dw-reset-link {
          background: none;
          border: none;
          color: #7a7a60;
          font-size: 13px;
          font-family: "DM Sans", sans-serif;
          cursor: pointer;
          margin-top: 4px;
          padding: 4px;
        }

        .dw-reset-link:hover { color: #1a1a0f; }

        @media (max-width: 480px) {
          .dw-slots-grid { grid-template-columns: repeat(2, 1fr); }
          .dw-date-btn { min-width: 56px; padding: 8px 4px; }
          .dw-date-num { font-size: 15px; }
        }
      `}</style>
    </div>
  );
}
