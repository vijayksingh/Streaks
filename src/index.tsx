import { Action, ActionPanel, Detail, Form, List, LocalStorage, popToRoot } from "@raycast/api";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface Streak {
  id: string;
  name: string;
  startDate: string;
  markedDates: string[];
  weekendMode: boolean;
}

const STREAK_STORAGE_KEY = "streaks";

export default function Command() {
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

  function handleCreateStreak(newStreak: Streak) {
    saveStreaks([...streaks, newStreak]);
  }

  function handleMarkStreak(streakId: string) {
    const updatedStreaks = streaks.map((streak) => {
      if (streak.id === streakId) {
        const today = new Date().toISOString().split("T")[0];
        return { ...streak, markedDates: [...streak.markedDates, today] };
      }
      return streak;
    });
    saveStreaks(updatedStreaks);
  }

  return (
    <List>
      {/* ... */}
      <List.Section title="Your Streaks">
        {streaks.map((streak) => (
          <List.Item
            key={streak.id}
            icon="streak-icon.png"
            title={streak.name}
            subtitle={`Started ${formatDistanceToNow(new Date(streak.startDate))} ago`}
            actions={
              <ActionPanel>
                <Action.Push
                  title="View Details"
                  target={<StreakDetail streak={streak} />}
                />
              </ActionPanel>
            }
            accessories={[
              {
                text: `${streak.markedDates.length} days`,
                icon: "checkmark-icon.png",
              },
            ]}
          />
        ))}
      </List.Section>
      <List.Section title="Mark Streak as Completed">
        {streaks.map((streak) => (
          <List.Item
            key={`mark-${streak.id}`}
            icon="checkmark-icon.png"
            title={`Mark "${streak.name}" as Completed`}
            actions={
              <ActionPanel>
                <Action
                  title="Mark as Completed"
                  onAction={() => handleMarkStreak(streak.id)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

function CreateStreakForm(props: { onCreateStreak: (streak: Streak) => void }) {
  async function handleSubmit(values: { name: string; weekendMode: boolean }) {
    const newStreak: Streak = {
      id: Math.random().toString(36).substring(7),
      name: values.name,
      startDate: new Date().toISOString(),
      markedDates: [],
      weekendMode: values.weekendMode,
    };
    props.onCreateStreak(newStreak);
    popToRoot(); // Navigate back to the list page after creating a streak
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Streak Name" placeholder="Enter streak name" />
      <Form.Checkbox id="weekendMode" label="Enable Weekend Mode" />
    </Form>
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

function renderStreakProgress(streak: Streak) {
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