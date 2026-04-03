import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { essay, taskType, minWords, promptText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert IELTS examiner with 10+ years of experience.
Evaluate the student's writing for IELTS ${taskType}.

The prompt was: "${promptText}"

Scoring criteria (0–9, increments of 0.5):
- task_achievement: answered all parts, sufficient detail, word count ${minWords}+
- coherence_cohesion: structure, paragraphing, linking words
- lexical_resource: vocabulary range, synonyms, accuracy
- grammatical_range: variety of structures, accuracy

You MUST respond using the suggest_scores tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: essay },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_scores",
              description: "Return IELTS band scores and detailed feedback",
              parameters: {
                type: "object",
                properties: {
                  task_achievement: { type: "number" },
                  coherence_cohesion: { type: "number" },
                  lexical_resource: { type: "number" },
                  grammatical_range: { type: "number" },
                  overall: { type: "number" },
                  band_level: { type: "string" },
                  task_feedback: { type: "string" },
                  coherence_feedback: { type: "string" },
                  lexical_feedback: { type: "string" },
                  grammar_feedback: { type: "string" },
                  errors: { type: "array", items: { type: "string" } },
                  corrections: { type: "array", items: { type: "string" } },
                  improvement_tips: { type: "array", items: { type: "string" } },
                },
                required: [
                  "task_achievement", "coherence_cohesion", "lexical_resource",
                  "grammatical_range", "overall", "band_level",
                  "task_feedback", "coherence_feedback", "lexical_feedback", "grammar_feedback",
                  "errors", "corrections", "improvement_tips"
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_scores" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      scores: {
        task_achievement: result.task_achievement,
        coherence_cohesion: result.coherence_cohesion,
        lexical_resource: result.lexical_resource,
        grammatical_range: result.grammatical_range,
        overall: result.overall,
      },
      feedback: {
        task_feedback: result.task_feedback,
        coherence_feedback: result.coherence_feedback,
        lexical_feedback: result.lexical_feedback,
        grammar_feedback: result.grammar_feedback,
        errors: result.errors,
        corrections: result.corrections,
        improvement_tips: result.improvement_tips,
        band_level: result.band_level,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-essay error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
