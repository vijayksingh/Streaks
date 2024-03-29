import { Action, ActionPanel, Form, LocalStorage, popToRoot } from "@raycast/api";
import { STREAK_STORAGE_KEY } from "./constants";
import { Streak } from "./types";

// Create Habit Command
export default function CreateHabitCommand() {
  async function handleCreateStreak(newStreak: Streak) {
    const storedStreaks = await LocalStorage.getItem<string>(STREAK_STORAGE_KEY);
    const streaks = storedStreaks ? JSON.parse(storedStreaks) : [];
    const updatedStreaks = [...streaks, newStreak];
    await LocalStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedStreaks));
    popToRoot();
  }

  return <CreateStreakForm onCreateStreak={handleCreateStreak} />;
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
      <Form.TextField id="name" title="Habit Name" placeholder="Enter habit name" />
      <Form.Checkbox id="weekendMode" label="Enable Weekend Mode" />
    </Form>
  );
}
