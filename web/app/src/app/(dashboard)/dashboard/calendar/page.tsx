import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, EmptyState } from "@/components/ui";
import { CalendarView } from "@/components/calendar";
import type { ExerciseType } from "@/types/database";

export const metadata = {
  title: "Calendrier",
};

interface SessionData {
  id: string;
  name: string;
  description: string | null;
  day_of_week: number | null;
  estimated_duration_minutes: number | null;
  session_type?: ExerciseType;
  program: {
    id: string;
    name: string;
  };
}

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the current date
  const today = new Date();
  const weekDays = getWeekDays(today);

  // Get assigned programs first
  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("program_id")
    .eq("athlete_id", user.id)
    .eq("is_deleted", false);

  const assignedProgramIds = assignments?.map((a) => a.program_id) || [];

  // Get all sessions from assigned programs
  let assignedSessions: SessionData[] = [];

  if (assignedProgramIds.length > 0) {
    const { data } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        description,
        day_of_week,
        estimated_duration_minutes,
        session_type,
        program:programs!inner(id, name)
      `)
      .eq("is_deleted", false)
      .in("program_id", assignedProgramIds);

    assignedSessions = (data || []).map(s => ({
      ...s,
      session_type: (s.session_type || "strength") as ExerciseType,
    })) as SessionData[];
  }

  // Try to get sessions from own programs (athlete created) - requires migration 007
  let ownSessions: SessionData[] = [];
  const { data: ownData, error: ownError } = await supabase
    .from("sessions")
    .select(`
      id,
      name,
      description,
      day_of_week,
      estimated_duration_minutes,
      session_type,
      program:programs!inner(id, name)
    `)
    .eq("is_deleted", false)
    .eq("programs.created_by", user.id)
    .is("programs.coach_id", null);

  // Only use ownSessions if no error (created_by column might not exist)
  if (!ownError) {
    ownSessions = (ownData || []).map(s => ({
      ...s,
      session_type: (s.session_type || "strength") as ExerciseType,
    })) as SessionData[];
  }

  const allSessions: SessionData[] = [
    ...(ownSessions || []),
    ...(assignedSessions || []),
  ] as SessionData[];

  // Get completed sessions for this week
  const weekStart = new Date(weekDays[0]);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekDays[6]);
  weekEnd.setHours(23, 59, 59, 999);

  const { data: completedLogs } = await supabase
    .from("session_logs")
    .select("session_id, completed_at, created_at")
    .eq("athlete_id", user.id)
    .not("completed_at", "is", null)
    .gte("created_at", weekStart.toISOString())
    .lte("created_at", weekEnd.toISOString());

  // Map completed sessions by day
  const completedByDay = new Map<number, Set<string>>();
  completedLogs?.forEach((log) => {
    const date = new Date(log.completed_at!);
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    if (!completedByDay.has(dayOfWeek)) {
      completedByDay.set(dayOfWeek, new Set());
    }
    completedByDay.get(dayOfWeek)!.add(log.session_id);
  });

  // Create set of all completed session IDs
  const completedSessionIds = new Set<string>(
    completedLogs?.map((log) => log.session_id) || []
  );

  // Get workout counts by month for year view
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

  const { data: yearLogs } = await supabase
    .from("session_logs")
    .select("completed_at")
    .eq("athlete_id", user.id)
    .not("completed_at", "is", null)
    .gte("created_at", yearStart.toISOString())
    .lte("created_at", yearEnd.toISOString());

  const workoutCountsByMonth: Record<number, number> = {};
  yearLogs?.forEach((log) => {
    const month = new Date(log.completed_at!).getMonth();
    workoutCountsByMonth[month] = (workoutCountsByMonth[month] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Calendrier</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Visualisez votre planning d&apos;entrainement
        </p>
      </div>

      {/* Calendar View */}
      {allSessions.length > 0 ? (
        <CalendarView
          sessions={allSessions}
          completedSessionIds={completedSessionIds}
          completedByDay={completedByDay}
          workoutCountsByMonth={workoutCountsByMonth}
        />
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon="calendar"
              title="Aucune seance planifiee"
              description="Creez un programme avec des seances assignees a des jours de la semaine pour les voir apparaitre ici."
              action={{
                label: "Creer un programme",
                href: "/dashboard/programs/new",
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function
function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  const monday = new Date(d);
  monday.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + i);
    return newDate;
  });
}
