import React from 'react';

/**
 * AdherenceChart — pure SVG/CSS weekly bar chart
 * Expects a `daily` object: { 'YYYY-MM-DD': { taken: n, missed: n, total: n } }
 * and a `streak` number.
 */
const AdherenceChart = ({ daily = {}, streak = 0, score = 100 }) => {
    const days = Object.keys(daily).sort();
    const maxTotal = Math.max(...days.map(d => daily[d].total), 1);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-4">
            {/* Score + Streak Row */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[120px] p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-3xl font-black text-emerald-500">{score}%</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Adherence Score</p>
                </div>
                <div className="flex-1 min-w-[120px] p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-3xl font-black text-amber-500">🔥 {streak}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Day Streak</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Weekly Adherence</p>
                <div className="flex items-end justify-between gap-2 h-32">
                    {days.map((day) => {
                        const d = daily[day];
                        const takenPct = maxTotal > 0 ? (d.taken / maxTotal) * 100 : 0;
                        const missedPct = maxTotal > 0 ? (d.missed / maxTotal) * 100 : 0;
                        const label = dayLabels[new Date(day + 'T12:00:00').getDay()];
                        const isToday = day === new Date().toISOString().split('T')[0];

                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex flex-col justify-end gap-px" style={{ height: '96px' }}>
                                    {/* Missed (red, on top) */}
                                    {d.missed > 0 && (
                                        <div
                                            className="w-full rounded-t-sm bg-rose-500/70 transition-all duration-700"
                                            style={{ height: `${missedPct}%` }}
                                        />
                                    )}
                                    {/* Taken (green, base) */}
                                    {d.taken > 0 && (
                                        <div
                                            className="w-full rounded-t-sm bg-emerald-500/80 transition-all duration-700"
                                            style={{ height: `${takenPct}%` }}
                                        />
                                    )}
                                    {/* Empty state */}
                                    {d.total === 0 && (
                                        <div className="w-full h-1 rounded-full bg-gray-200 dark:bg-white/10" />
                                    )}
                                </div>
                                <p className={`text-[9px] font-black uppercase tracking-wider ${isToday ? 'text-indigo-400' : 'text-gray-500'}`}>
                                    {label}
                                </p>
                                {isToday && <div className="w-1 h-1 rounded-full bg-indigo-400" />}
                            </div>
                        );
                    })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Taken</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-rose-500/70" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Missed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdherenceChart;
