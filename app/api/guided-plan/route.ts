import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrackConfig {
  track: string;
  chapter_ids: number[];
  mini_test_interval_days: number;
  weekly_mock_interval_days: number;
  chapters_per_step: number;
}

interface GuidedState {
  user_id: string;
  track: string;
  progression_step: number;
  chapters_completed: number[];
  current_month_start_step: number;
  streak_count: number;
  last_active_date: string | null;
  last_mini_test_date: string | null;
  last_weekly_mock_date: string | null;
  last_monthly_mock_date: string | null;
}

interface TodayTask {
  type: "daily_10q" | "mini_test" | "weekly_mock" | "monthly_mock" | "chapter_practice";
  label: string;
  description: string;
  href: string;
  chapterIds?: number[];
  chapterNames?: string[];
  isCompleted: boolean;
  icon: string;
  daysUntil?: number; // 0 = due today, >0 = upcoming
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(dateA: string | null, dateB: string): number {
  if (!dateA) return 999;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor(
    (new Date(dateB).getTime() - new Date(dateA).getTime()) / msPerDay
  );
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// Chapter name lookup (mirrors lib/data.ts — kept local to avoid client bundle)
const CHAPTER_NAMES: Record<number, string> = {
  1: "The Living World", 2: "Biological Classification", 3: "Plant Kingdom",
  4: "Animal Kingdom", 5: "Morphology of Flowering Plants",
  6: "Anatomy of Flowering Plants", 7: "Structural Organisation in Animals",
  8: "Cell – The Unit of Life", 9: "Biomolecules",
  10: "Cell Cycle and Cell Division", 11: "Transport in Plants",
  12: "Mineral Nutrition", 13: "Photosynthesis in Higher Plants",
  14: "Respiration in Plants", 15: "Plant Growth and Development",
  16: "Digestion and Absorption", 17: "Breathing and Exchange of Gases",
  18: "Body Fluids and Circulation", 19: "Excretory Products and their Elimination",
  20: "Locomotion and Movement", 21: "Neural Control and Coordination",
  22: "Chemical Coordination and Integration", 23: "Reproduction in Organisms",
  24: "Sexual Reproduction in Flowering Plants", 25: "Human Reproduction",
  26: "Reproductive Health", 27: "Principles of Inheritance and Variation",
  28: "Molecular Basis of Inheritance", 29: "Evolution",
  30: "Human Health and Disease", 31: "Strategies for Enhancement in Food Production",
  32: "Microbes in Human Welfare", 33: "Biotechnology Principles and Processes",
  34: "Biotechnology and its Applications", 35: "Organisms and Populations",
  36: "Ecosystem", 37: "Biodiversity and Conservation", 38: "Environmental Issues",
};

// ─── Today's plan generator ───────────────────────────────────────────────────

async function generateTodayPlan(
  state: GuidedState,
  config: TrackConfig
): Promise<TodayTask[]> {
  const today = todayISO();
  const tasks: TodayTask[] = [];

  // Check what was already completed today
  const { data: completedToday } = await supabaseAdmin
    .from("user_daily_tasks")
    .select("task_type, completed_at")
    .eq("user_id", state.user_id)
    .gte("generated_at", today + "T00:00:00Z")
    .lte("generated_at", today + "T23:59:59Z");

  const completedTypes = new Set(
    (completedToday || [])
      .filter((t) => t.completed_at !== null)
      .map((t) => t.task_type)
  );

  // 1. Daily 10Q — always present
  tasks.push({
    type: "daily_10q",
    label: "Daily 10Q Challenge",
    description: "10 rapid-fire questions · ~5 mins",
    href: "/daily-10q",
    icon: "⚡",
    isCompleted: completedTypes.has("daily_10q"),
  });

  // 2. Current chapter practice
  const currentChapterIndex = state.progression_step * config.chapters_per_step;
  const currentChapterId = config.chapter_ids[currentChapterIndex] ?? null;
  if (currentChapterId) {
    tasks.push({
      type: "chapter_practice",
      label: CHAPTER_NAMES[currentChapterId] ?? `Chapter ${currentChapterId}`,
      description: "Continue chapter practice",
      href: `/practice?chapter=${currentChapterId}`,
      chapterIds: [currentChapterId],
      icon: "📖",
      isCompleted: state.chapters_completed.includes(currentChapterId),
    });
  }

  // 3. Mini Test — every N days (always shown, daysUntil > 0 if not yet due)
  const daysSinceMini = daysBetween(state.last_mini_test_date, today);
  const miniDaysUntil = Math.max(0, config.mini_test_interval_days - daysSinceMini);
  tasks.push({
    type: "mini_test",
    label: "Mini Mock Test",
    description: miniDaysUntil === 0
      ? "25 questions · 25 mins"
      : `Available in ${miniDaysUntil} day${miniDaysUntil !== 1 ? "s" : ""}`,
    href: "/mini-mock",
    icon: "📝",
    isCompleted: miniDaysUntil === 0 ? completedTypes.has("mini_test") : false,
    daysUntil: miniDaysUntil,
  });

  // 4. Weekly Mock — every 7 days (always shown, daysUntil > 0 if not yet due)
  const daysSinceWeekly = daysBetween(state.last_weekly_mock_date, today);
  const weeklyDaysUntil = Math.max(0, config.weekly_mock_interval_days - daysSinceWeekly);
  const mockChapterIds = getMockChapterIds(state, config);
  const mockChapterNames = mockChapterIds.map((id) => CHAPTER_NAMES[id] ?? `Ch${id}`);
  tasks.push({
    type: "weekly_mock",
    label: "Weekly Mock Test",
    description: weeklyDaysUntil === 0
      ? (mockChapterNames.length > 1
          ? `Mixed: ${mockChapterNames.join(" + ")}`
          : `Focus: ${mockChapterNames[0] ?? "All chapters"}`)
      : `Available in ${weeklyDaysUntil} day${weeklyDaysUntil !== 1 ? "s" : ""}`,
    href: "/weekly-mock",
    chapterIds: mockChapterIds,
    chapterNames: mockChapterNames,
    icon: "🎯",
    isCompleted: weeklyDaysUntil === 0 ? completedTypes.has("weekly_mock") : false,
    daysUntil: weeklyDaysUntil,
  });

  // 5. Monthly Grand Mock — after completing a chapter block
  const completedThisMonth =
    state.chapters_completed.length - state.current_month_start_step;
  const daysSinceMonthly = daysBetween(state.last_monthly_mock_date, today);
  if (completedThisMonth >= 4 && daysSinceMonthly >= 28) {
    tasks.push({
      type: "monthly_mock",
      label: "Monthly Grand Mock",
      description: "Full 90-question test · 90 mins",
      href: "/mock-test",
      icon: "🏆",
      isCompleted: completedTypes.has("monthly_mock"),
    });
  }

  return tasks;
}

// Determines which chapters the weekly mock should cover based on step cycle
// Cycle: Ch1 → Ch2 → Ch1+2 → Ch3 → Ch4 → Ch3+4 → ...
function getMockChapterIds(state: GuidedState, config: TrackConfig): number[] {
  const step = state.progression_step;
  const chapters = config.chapter_ids;
  const cycle = step % 3;
  const pair = Math.floor(step / 3);

  if (cycle === 0) return [chapters[pair * 2]].filter(Boolean);
  if (cycle === 1) return [chapters[pair * 2 + 1]].filter(Boolean);
  // cycle === 2: mixed
  return [chapters[pair * 2], chapters[pair * 2 + 1]].filter(Boolean);
}

// ─── GET /api/guided-plan ─────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only guided plan users
    if (user.subscriptionPlan !== "guided") {
      return NextResponse.json({ error: "Guided plan required" }, { status: 403 });
    }

    // Load or create user_guided_state
    let { data: state, error: stateError } = await supabaseAdmin
      .from("user_guided_state")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (stateError) {
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    // First visit — initialize state using users.track column
    if (!state) {
      const { data: dbUser } = await supabaseAdmin
        .from("users")
        .select("track")
        .eq("id", user.id)
        .maybeSingle();

      const track = dbUser?.track ?? "class12";

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("user_guided_state")
        .insert({
          user_id: user.id,
          track,
          progression_step: 0,
          chapters_completed: [],
          current_month_start_step: 0,
          streak_count: 0,
          last_active_date: null,
          last_mini_test_date: null,
          last_weekly_mock_date: null,
          last_monthly_mock_date: null,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      state = inserted;
    }

    // Update streak
    const today = todayISO();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = state.streak_count;

    if (state.last_active_date === yesterday) {
      newStreak = state.streak_count + 1;
    } else if (state.last_active_date !== today) {
      newStreak = 1; // reset (missed a day)
    }

    if (state.last_active_date !== today) {
      await supabaseAdmin
        .from("user_guided_state")
        .update({ streak_count: newStreak, last_active_date: today })
        .eq("user_id", user.id);
      state.streak_count = newStreak;
      state.last_active_date = today;
    }

    // Load track config
    const { data: config, error: configError } = await supabaseAdmin
      .from("track_config")
      .select("*")
      .eq("track", state.track)
      .single();

    if (configError || !config) {
      return NextResponse.json({ error: "Track config missing" }, { status: 500 });
    }

    // Generate today's plan
    const tasks = await generateTodayPlan(state, config);

    const totalChapters = config.chapter_ids.length;
    const completedChapters = state.chapters_completed.length;

    return NextResponse.json({
      track: state.track,
      streak: state.streak_count,
      progressionStep: state.progression_step,
      completedChapters,
      completedChapterIds: state.chapters_completed,
      totalChapters,
      percentComplete: Math.round((completedChapters / totalChapters) * 100),
      tasks,
    });
  } catch (err) {
    console.error("guided-plan GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── POST /api/guided-plan ────────────────────────────────────────────────────
// Body: { taskType, score?, accuracy?, chapterId? }

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskType, score, accuracy, chapterId, chapterNames } = await request.json();

    const validTypes = [
      "daily_10q",
      "mini_test",
      "weekly_mock",
      "monthly_mock",
      "chapter_practice",
    ];
    if (!validTypes.includes(taskType)) {
      return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const today = now.split("T")[0];

    // Insert completed task log
    const taskRefId =
      taskType === "weekly_mock" && chapterNames?.length
        ? JSON.stringify(chapterNames)
        : chapterId
        ? String(chapterId)
        : null;

    await supabaseAdmin.from("user_daily_tasks").insert({
      user_id: user.id,
      task_type: taskType,
      task_ref_id: taskRefId,
      generated_at: now,
      completed_at: now,
      score: score ?? null,
      accuracy: accuracy ?? null,
    });

    // Update last_*_date on guided state
    const stateUpdates: Record<string, string | number> = {};

    if (taskType === "mini_test") stateUpdates.last_mini_test_date = today;
    if (taskType === "weekly_mock") stateUpdates.last_weekly_mock_date = today;
    if (taskType === "monthly_mock") {
      stateUpdates.last_monthly_mock_date = today;
      // Advance monthly start step
      const { data: state } = await supabaseAdmin
        .from("user_guided_state")
        .select("chapters_completed")
        .eq("user_id", user.id)
        .maybeSingle();
      if (state) {
        stateUpdates.current_month_start_step = state.chapters_completed.length;
      }
    }

    // Advance progression step when chapter is completed
    if (taskType === "chapter_practice" && chapterId) {
      const { data: state } = await supabaseAdmin
        .from("user_guided_state")
        .select("chapters_completed, progression_step, track")
        .eq("user_id", user.id)
        .maybeSingle();

      if (state && !state.chapters_completed.includes(chapterId)) {
        const newCompleted = [...state.chapters_completed, chapterId];
        stateUpdates.chapters_completed = newCompleted as unknown as number;

        // Advance step every chapters_per_step completions
        const { data: config } = await supabaseAdmin
          .from("track_config")
          .select("chapters_per_step")
          .eq("track", state.track ?? "class12")
          .maybeSingle();

        const perStep = config?.chapters_per_step ?? 2;
        if (newCompleted.length % perStep === 0) {
          stateUpdates.progression_step = state.progression_step + 1;
        }
      }
    }

    if (Object.keys(stateUpdates).length > 0) {
      stateUpdates.updated_at = now;
      await supabaseAdmin
        .from("user_guided_state")
        .update(stateUpdates)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("guided-plan POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}