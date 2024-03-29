import { Streak } from "./types";

export function renderWeekView(streak: Streak) {
  const { markedDates, startDate } = streak;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
  const currentWeekofYear = Math.ceil(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  let weekView = "";
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    const formattedDate = currentDate.toISOString().split("T")[0];

    if (markedDates.includes(formattedDate)) {
      weekView += "✅ ";
    } else {
      weekView += "⬜ ";
    }
  }

  return `Week ${currentWeekofYear}:  ${weekView}`;
}

export function renderStreakProgress(streak: Streak) {
  const { markedDates, startDate, weekendMode } = streak;
  const startDateObj = new Date(startDate);
  const today = new Date();
  const totalDays = Math.ceil((today.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24));

  let streakProgress = "";
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + i);
    const formattedDate = currentDate.toISOString().split("T")[0];

    if (markedDates.includes(formattedDate)) {
      streakProgress += "🟩";
    } else if (weekendMode && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
      streakProgress += "🟦";
    } else {
      streakProgress += "⬜";
    }

    if ((i + 1) % 7 === 0) {
      streakProgress += "\n";
    }
  }

  return streakProgress;
}
