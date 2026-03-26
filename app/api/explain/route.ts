import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory cache (resets on server restart)
const cache = new Map<string, string>();

// Monthly query counter
let monthlyCount = 0;
let monthlyReset = new Date();

const MONTHLY_HARD_CAP = 15000;
const DAILY_USER_LIMIT = 5;

function getCacheKey(question: string, correctAnswer: string): string {
  return `${question.slice(0, 50)}_${correctAnswer}`.toLowerCase().replace(/\s/g, "_");
}

function checkMonthlyReset() {
  const now = new Date();
  if (now.getMonth() !== monthlyReset.getMonth()) {
    monthlyCount = 0;
    monthlyReset = now;
  }
}

export async function POST(req: Request) {
  try {
    const { question, options, correctAnswer, userId } = await req.json();

    // 1. Monthly hard cap check
    checkMonthlyReset();
    if (monthlyCount >= MONTHLY_HARD_CAP) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Monthly limit reached." },
        { status: 429 }
      );
    }

    // 2. Daily user limit check
    const today = new Date().toDateString();
    const userKey = `usage_${userId}_${today}`;
    const userUsage = cache.get(userKey) ? parseInt(cache.get(userKey)!) : 0;

    if (userUsage >= DAILY_USER_LIMIT) {
      return NextResponse.json(
        { error: "Daily limit reached. You can ask 5 questions per day." },
        { status: 429 }
      );
    }

    // 3. Cache check — same question already answered?
    const cacheKey = getCacheKey(question, correctAnswer);
    if (cache.has(cacheKey)) {
      return NextResponse.json({
        explanation: cache.get(cacheKey),
        cached: true,
      });
    }

    // 4. Call Claude API — ultra short prompt
    const prompt = `NEET Biology MCQ:
Q: ${question}
Options: ${options.join(" | ")}
Correct Answer: ${correctAnswer}

Give a concise 3-line explanation:
1. Why this answer is correct (1 line)
2. Key concept to remember (1 line)  
3. Common mistake students make (1 line)`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const explanation =
      message.content[0].type === "text" ? message.content[0].text : "";

    // 5. Save to cache
    cache.set(cacheKey, explanation);

    // 6. Update counters
    cache.set(userKey, (userUsage + 1).toString());
    monthlyCount++;

    return NextResponse.json({ explanation, cached: false });
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json(
      { error: "Failed to get explanation. Please try again." },
      { status: 500 }
    );
  }
}