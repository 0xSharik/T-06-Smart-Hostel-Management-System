/**
 * src/pages/MessPage.jsx
 */

import { useQuery, useMutation, useQueryClient } from "react-query";
import { UtensilsCrossed, Plus, X, Star } from "lucide-react";
import { messAPI } from "../api";
import useAuthStore from "../store/authStore";
import { useState } from "react";
import toast from "react-hot-toast";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEALS = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
const MEAL_TIMES = { BREAKFAST: "7:00 – 9:00 AM", LUNCH: "12:00 – 2:00 PM", SNACK: "4:30 – 5:30 PM", DINNER: "7:30 – 9:30 PM" };
const MEAL_COLORS = { BREAKFAST: "indigo", LUNCH: "emerald", SNACK: "amber", DINNER: "violet" };

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Star size={20} fill={s <= value ? "#f59e0b" : "transparent"} color={s <= value ? "#f59e0b" : "#64748b"} />
        </button>
      ))}
    </div>
  );
}

export default function MessPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WARDEN";
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbForm, setFbForm] = useState({ messMenuId: "", rating: 0, comment: "" });

  const { data: menuRes, isLoading } = useQuery("mess-menu", messAPI.getWeeklyMenu);
  const menu = menuRes?.data?.data || {};

  const feedbackMutation = useMutation(messAPI.submitFeedback, {
    onSuccess: () => { setShowFeedback(false); toast.success("Feedback submitted!"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mess Menu</h1>
          <p>Weekly mess schedule — Mon to Sun.</p>
        </div>
      </div>

      {/* Day Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "var(--space-xl)", flexWrap: "wrap" }}>
        {DAYS.map((day) => (
          <button
            key={day}
            id={`day-tab-${day}`}
            className={`btn ${activeDay === day ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => setActiveDay(day)}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Meals Grid */}
      {isLoading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="grid-2" style={{ marginBottom: "var(--space-xl)" }}>
          {MEALS.map((meal) => {
            const entry = menu[activeDay]?.[meal];
            return (
              <div key={meal} className="card" style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className={`stat-icon ${MEAL_COLORS[meal]}`} style={{ width: 40, height: 40 }}>
                      <UtensilsCrossed size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{meal}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{MEAL_TIMES[meal]}</div>
                    </div>
                  </div>
                  {entry && !isAdmin && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setFbForm(f => ({ ...f, messMenuId: entry.id })); setShowFeedback(true); }}>
                      <Star size={14} /> Rate
                    </button>
                  )}
                </div>

                {entry ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {entry.items.map((item, i) => (
                      <span key={i} style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-full)",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.8125rem",
                        color: "var(--text-secondary)"
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>
                    Menu not set for this slot.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowFeedback(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Rate this Meal</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowFeedback(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!fbForm.rating) return toast.error("Please select a rating"); feedbackMutation.mutate(fbForm); }}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <StarRating value={fbForm.rating} onChange={(v) => setFbForm(f => ({ ...f, rating: v }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Comment (optional)</label>
                <textarea className="form-textarea" rows={3} placeholder="How was the food?" value={fbForm.comment} onChange={e => setFbForm(f => ({ ...f, comment: e.target.value }))} style={{ resize: "none" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFeedback(false)}>Cancel</button>
                <button id="feedback-submit" type="submit" className="btn btn-primary" disabled={feedbackMutation.isLoading}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
