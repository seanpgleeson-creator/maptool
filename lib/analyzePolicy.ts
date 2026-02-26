import OpenAI from 'openai'

export type PolicyAnalysisResult = {
  appliesToAllRetailers: boolean
  segmentDescription: string | null
  consequencesSpecific: boolean
  consequencesSummary: string | null
}

const SYSTEM_PROMPT = `You analyze MAP (Minimum Advertised Price) policy documents from vendors/suppliers.
Output valid JSON only, no markdown or explanation.`

const USER_PROMPT = (policyText: string) => `Analyze this MAP policy text and return a JSON object with exactly these keys (all required):
- "appliesToAllRetailers": boolean — true if the policy applies to all retailers/channels; false if it only applies to a specific segment (e.g. "big box retailers", "e-commerce only", "authorized dealers").
- "segmentDescription": string | null — if appliesToAllRetailers is false, a short plain-language description of which segment (e.g. "big box retailers only"); otherwise null.
- "consequencesSpecific": boolean — true if the policy states specific action steps for violations (e.g. "first violation: warning; second: 90-day supply cutoff; third: termination"). false if consequences are vague or not stated.
- "consequencesSummary": string | null — if consequencesSpecific is true, a brief summary of the steps (1–2 sentences); otherwise null.

Policy text:
---
${policyText.slice(0, 12000)}
---`

export async function analyzePolicy(
  policyText: string,
  apiKey: string,
): Promise<{ ok: true; result: PolicyAnalysisResult } | { ok: false; error: string }> {
  if (!policyText.trim()) {
    return { ok: false, error: 'No policy text to analyze.' }
  }

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT(policyText) },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return { ok: false, error: 'Empty response from policy analysis.' }

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result: PolicyAnalysisResult = {
      appliesToAllRetailers: Boolean(parsed.appliesToAllRetailers),
      segmentDescription:
        typeof parsed.segmentDescription === 'string'
          ? parsed.segmentDescription
          : null,
      consequencesSpecific: Boolean(parsed.consequencesSpecific),
      consequencesSummary:
        typeof parsed.consequencesSummary === 'string'
          ? parsed.consequencesSummary
          : null,
    }
    return { ok: true, result }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `Policy analysis failed: ${message}` }
  }
}
