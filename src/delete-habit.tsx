import { Action, ActionPanel, List, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { STREAK_STORAGE_KEY } from "./constants";
import { Streak } from "./types";

// Delete Habit Command
export default function DeleteHabitCommand() {
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

  async function handleDeleteStreak(streakId: string) {
    const updatedStreaks = streaks.filter((streak) => streak.id !== streakId);
    await LocalStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedStreaks));
    setStreaks(updatedStreaks);
  }

  return (
    <List>
      <List.Section title="Select Habit to Delete">
        {streaks.map((streak) => (
          <List.Item
            key={streak.id}
            title={streak.name}
            actions={
              <ActionPanel>
                <Action title="Delete Habit" onAction={() => handleDeleteStreak(streak.id)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
