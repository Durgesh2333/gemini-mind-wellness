import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please enter how you are feeling today' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an empathetic AI mental wellness assistant for students. Analyze the student's input and provide:
1. A stress score from 0-100 (0 = no stress, 100 = extreme stress)
2. Main stress factors identified in their message
3. 2-3 personalized, actionable wellness tips

Be supportive, kind, and specific. Focus on practical advice that students can implement.

Return your response as JSON with this exact structure:
{
  "stressScore": number (0-100),
  "stressFactors": ["factor1", "factor2", ...],
  "wellnessTips": ["tip1", "tip2", "tip3"]
}`;

    console.log('Calling Lovable AI with text:', text.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service unavailable. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', data);
    
    const aiMessage = data.choices[0].message.content;
    
    // Parse the JSON response from AI
    let result;
    try {
      // Try to extract JSON from the response (in case AI adds extra text)
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiMessage);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiMessage);
      // Fallback response if parsing fails
      result = {
        stressScore: 50,
        stressFactors: ['Unable to analyze at this time'],
        wellnessTips: ['Please try rephrasing your thoughts', 'Take a deep breath', 'Remember, it\'s okay to ask for help']
      };
    }

    // Validate the structure
    if (!result.stressScore || !Array.isArray(result.stressFactors) || !Array.isArray(result.wellnessTips)) {
      console.error('Invalid AI response structure:', result);
      result = {
        stressScore: result.stressScore || 50,
        stressFactors: Array.isArray(result.stressFactors) ? result.stressFactors : ['General stress detected'],
        wellnessTips: Array.isArray(result.wellnessTips) ? result.wellnessTips : ['Take breaks', 'Stay hydrated', 'Talk to someone you trust']
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-stress function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: 'Please try again later'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
