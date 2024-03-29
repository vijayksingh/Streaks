import { Action, ActionPanel, Detail, List, LocalStorage, popToRoot } from "@raycast/api";
import { useEffect, useState } from "react";
import { STREAK_STORAGE_KEY } from "./constants";
import { Streak } from "./types";
import { renderStreakProgress, renderWeekView } from "./utils";

// Show Habits Command
export default function ShowHabitsCommand() {
  const [streaks, setStreaks] = useState<Streak[]>([]);

  useEffect(() => {
    async function fetchStreaks() {
      const storedStreaks = await LocalStorage.getItem<string>(STREAK_STORAGE_KEY);
      if (storedStreaks) {
        setStreaks(JSON.parse(storedStreaks));
      }
    }
    fetchStreaks();
  }, []);

  async function saveStreaks(updatedStreaks: Streak[]) {
    await LocalStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedStreaks));
    setStreaks(updatedStreaks);
  }

  function handleToggleStreak(streakId: string) {
    const updatedStreaks = streaks.map((streak) => {
      if (streak.id === streakId) {
        const today = new Date().toISOString().split("T")[0];
        const markedDates = streak.markedDates.includes(today)
          ? streak.markedDates.filter((date) => date !== today)
          : [...streak.markedDates, today];
        return { ...streak, markedDates };
      }
      return streak;
    });
    saveStreaks(updatedStreaks);
  }

  return (
    <List>
      <List.Section title="Your Habits">
        {streaks.map((streak) => (
          <List.Item
            key={streak.id}
            icon={{
              source: "checkbox-icon.png",
              tintColor: streak.markedDates.includes(new Date().toISOString().split("T")[0]) ? "green" : undefined,
            }}
            title={`${streak.emoji} ${streak.name}`}
            accessories={[{ text: renderWeekView(streak) }]}
            actions={
              <ActionPanel>
                <Action.Push title="View Details" target={<StreakDetail streak={streak} />} />
                <Action title="Toggle Completed" onAction={() => handleToggleStreak(streak.id)} />
                <Action.Push title="Delete Habit" target={<DeleteConfirmationAction streakId={streak.id} />} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

function DeleteConfirmationAction(props: { streakId: string }) {
  async function handleDeleteStreak() {
    const storedStreaks = await LocalStorage.getItem<string>(STREAK_STORAGE_KEY);
    if (storedStreaks) {
      const streaks: Streak[] = JSON.parse(storedStreaks);
      const updatedStreaks = streaks.filter((streak) => streak.id !== props.streakId);
      await LocalStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedStreaks));
      popToRoot();
    }
  }

  return (
    <Detail
      markdown="Are you sure you want to delete this habit?"
      actions={
        <ActionPanel>
          <Action title="Confirm Delete" onAction={handleDeleteStreak} />
          <Action title="Cancel" onAction={popToRoot} />
        </ActionPanel>
      }
    />
  );
}

function StreakDetail(props: { streak: Streak }) {
  const { streak } = props;
  const startDate = new Date(streak.startDate);
  const totalDays = streak.markedDates.length;
  const weekendMode = streak.weekendMode ? "Enabled" : "Disabled";

  return (
    <Detail
      markdown={`
# ${streak.name}

- Start Date: ${startDate.toDateString()}
- Total Days: ${totalDays}
- Weekend Mode: ${weekendMode}

## Streak Progress
${renderStreakProgress(streak)}
      `}
    />
  );
}
