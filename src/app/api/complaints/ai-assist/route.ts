import { NextRequest, NextResponse } from "next/server";
import { generateComplaintSuggestions } from "@/lib/ai/complaint-assistant";

/**
 * POST /api/complaints/ai-assist
 * 
 * Provides AI assistance for drafting and categorizing citizen complaints.
 * Uses a pluggable architecture (currently backed by a deterministic local/mock provider).
 * Does not require external API keys.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const currentTitle = typeof body.currentTitle === "string" ? body.currentTitle.trim() : "";
    const currentDescription = typeof body.currentDescription === "string" ? body.currentDescription.trim() : "";
    const currentCategory = typeof body.currentCategory === "string" ? body.currentCategory.trim() : "";
    const ward = typeof body.ward === "string" ? body.ward.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";

    // Require at least some input to generate meaningful suggestions
    if (!prompt && !currentTitle && !currentDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a brief problem description or notes in simple language.",
        },
        { status: 400 }
      );
    }

    const suggestions = await generateComplaintSuggestions({
      prompt: prompt || currentTitle || currentDescription,
      currentTitle,
      currentDescription,
      currentCategory,
      ward,
      address,
    });

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    console.error("AI Complaint Assistant error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate complaint suggestions. Please try again or fill in the details manually.",
      },
      { status: 500 }
    );
  }
}
