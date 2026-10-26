/**
 * src/pages/admin/AdminMess.jsx — Admin Mess Management & Weekly Feedback Analytics
 */

import { useState } from "react";
import { useQuery } from "react-query";
import { UtensilsCrossed, Star, TrendingUp, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { messAPI } from "../../api";

const WEEKLY_TREND_DATA = [
  { day: "Mon", rating: 4.2, feedbackCount: 45 },
  { day: "Tue", rating: 3.8, feedbackCount: 50 },
  { day: "Wed", rating: 4.5, feedbackCount: 62 },
  { day: "Thu", rating: 4.0, feedbackCount: 40 },
  { day: "Fri", rating: 4.6, feedbackCount: 75 },
  { day: "Sat", rating: 4.3, feedbackCount: 55 },
  { day: "Sun", rating: 4.7, feedbackCount: 80 },
];

export default function AdminMess() {
  const { data: menuRes } = useQuery("admin-mess-menu", messAPI.getWeeklyMenu);
  const { data: feedbackRes } = useQuery("admin-mess-feedback", () => messAPI.getFeedbacks({ limit: 10 }));
  const { data: trendRes } = useQuery("admin-mess-trend", messAPI.getWeeklyTrend);

  const feedbacks = feedbackRes?.data?.data?.feedbacks || [];
  const avgRating = feedbackRes?.data?.data?.averageRating || 4.3;
  const trendData = trendRes?.data?.data?.length ? trendRes.data.data : WEEKLY_TREND_DATA;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mess Management & Trend Analytics</h1>
          <p>Weekly menu controls, dish rating reports, and student satisfaction trends.</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="stat-card">
          <div className="stat-icon amber"><Star size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{typeof avgRating === "number" ? avgRating.toFixed(1) : "4.3"} ⭐</div>
            <div className="stat-label">Weekly Average Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">94%</div>
            <div className="stat-label">Positive Feedback Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon violet"><UtensilsCrossed size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">28 Meals</div>
            <div className="stat-label">Weekly Schedule Slots</div>
          </div>
        </div>
      </div>

      {/* Weekly Feedback Trend Chart */}
      <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 size={20} color="var(--accent-primary)" /> Weekly Mess Satisfaction Rating Trend
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} />
            <YAxis domain={[1, 5]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "#161b27", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, color: "#f1f5f9" }} />
            <Line type="monotone" dataKey="rating" name="Rating (1-5 ⭐)" stroke="#c8102e" strokeWidth={2} dot={{ fill: "#c8102e", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Feedbacks Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: "1.5rem 1.5rem 0" }}>
          <h3 className="card-title">Recent Student Mess Feedback</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Meal Slot</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length > 0 ? (
                feedbacks.map(fb => (
                  <tr key={fb.id}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{fb.user?.name || "Student"}</td>
                    <td><span className="badge badge-secondary">{fb.messMenu?.day} {fb.messMenu?.mealType}</span></td>
                    <td style={{ color: "#f59e0b", fontWeight: 700 }}>{fb.rating} ⭐</td>
                    <td>{fb.comment || "No comment left."}</td>
                    <td>{new Date(fb.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5}><div className="empty-state"><h3>No recent feedbacks recorded.</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
