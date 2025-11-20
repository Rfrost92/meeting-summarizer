import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const mode = (formData.get("mode") as string) || "meeting"; // meeting | podcast | generic

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const MAX_SIZE = 25 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File is too large (max 25 MB)" },
                { status: 400 }
            );
        }

        // Blob -> File for OpenAI SDK
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = (file as any).name || "audio.mp3";

        const audioFile = new File([buffer], filename, { type: file.type });

        // 1) Transcription (Whisper)
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            // language: "en",
        });

        const transcriptText = transcription.text;

        // 2) Summary via Responses API + Structured Outputs (text.format)
        const systemPrompt = `
You are an expert AI assistant that summarizes audio transcripts.

Return a structured JSON object with the following shape:

{
  "summary": "short paragraph",
  "key_points": ["...", "..."],
  "action_items": ["...", "..."],
  "decisions": ["...", "..."]
}

Rules:
- Write in the same language as the transcript.
- Be concise but informative.
- "action_items" and "decisions" can be empty arrays if not applicable.
`;

        const userInstructions =
            mode === "meeting"
                ? "This transcript is from a business meeting. Focus on decisions, responsibilities and next steps."
                : mode === "podcast"
                    ? "This transcript is from a podcast episode. Focus on main themes and interesting insights."
                    : "This transcript is a generic audio recording. Provide a general useful summary.";

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Instructions: ${userInstructions}\n\nTranscript:\n${transcriptText}`,
                },
            ],
            // <<–– this replaced response_format
            text: {
                format: {
                    type: "json_schema",
                    name: "audio_summary",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            summary: { type: "string" },
                            key_points: {
                                type: "array",
                                items: { type: "string" },
                            },
                            action_items: {
                                type: "array",
                                items: { type: "string" },
                            },
                            decisions: {
                                type: "array",
                                items: { type: "string" },
                            },
                        },
                        required: ["summary", "key_points", "action_items", "decisions"],
                        additionalProperties: false,
                    },
                },
            },
        });

        const content = response.output[0].content[0];

        // With text.format JSON schema, the model returns JSON as text
        const jsonText =
            content.type === "output_text"
                ? content.text
                : JSON.stringify(content);

        const parsed = JSON.parse(jsonText);

        return NextResponse.json({
            transcript: transcriptText,
            summary: parsed.summary,
            keyPoints: parsed.key_points,
            actionItems: parsed.action_items,
            decisions: parsed.decisions,
        });
    } catch (error: any) {
        console.error("Summarize error:", error);
        return NextResponse.json(
            { error: error.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}
