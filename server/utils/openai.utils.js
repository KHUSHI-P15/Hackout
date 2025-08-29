async function generateQuestion(prompt) {
	const systemMessage = `
You are an AI that generates programming or academic questions.

The response must be a VALID JSON object following EXACTLY this schema:

{
  "difficulty": number,                  // 1 = EASY, 2 = MEDIUM, 3 = HARD
  "question": "string",                   // The actual question text
  "language": ["string"],                 // Only from: ["C", "C++", "JAVA", "PYTHON", "HTML/CSS/JS"]
  "isFunctionBased": boolean,             // true if question requires writing a function
  "function": "string",                   // Full function signature with braces if isFunctionBased is true, e.g., "int sum(int a, int b){}", else ""
  "marks": number,                        // Numeric marks value
  "timeRequired": number,                 // Time required in minutes (numeric)
  "wantAutoCalculate": boolean,           // Whether marks or time are auto-calculated
  "testcases": [                          // Array of test cases
    {
      "input": "string",
      "output": "string",
      "type": "PUBLIC" | "HIDDEN"
    }
  ],
  "attachment": null                      // null or URL string if there's an attachment
}

Rules:
1. Return ONLY valid JSON, no explanations, no markdown formatting.
2. Ensure all fields strictly match the data type and enum values.
3. If "isFunctionBased" is true:
   - "function" field MUST contain a complete function definition syntax for the selected language.
   - In ALL testcases, the "input" field MUST be comma-separated, with no extra spaces after commas.
     ✅ Example: "5,2" or "\"Patel\",\"Dhruv\""
     ❌ Wrong: "5 2" or "Patel Dhruv"
4. If "isFunctionBased" is false:
   - "function" field MUST be an empty string "".
   - In ALL testcases, the "input" field MUST be space-separated.
     ✅ Example: "5 2" or "\"Patel\" \"Dhruv\""
     ❌ Wrong: "5,2" or "Patel,Dhruv"
5. "difficulty" must be an integer: 1 for EASY, 2 for MEDIUM, 3 for HARD.
6. At least one PUBLIC and one HIDDEN test case must be included when generating testcases.
7. If generating test cases, ensure they are diverse and cover edge cases and input, output and type fields are mandatory irrespective of the "wantAutoCalculate" flag.
`;

	// Make request to Groq API
	const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'llama3-70b-8192',
			messages: [
				{ role: 'system', content: systemMessage },
				{ role: 'user', content: prompt },
			],
			temperature: 0.7,
		}),
	});

	const data = await response.json();

	if (!data.choices || !data.choices[0]?.message?.content) {
		throw new Error('No response from Groq API');
	}

	// Parse and return as JS object
	let jsonResponse;
	try {
		jsonResponse = JSON.parse(data.choices[0].message.content);
	} catch (err) {
		throw new Error('Invalid JSON returned from Groq');
	}

	return jsonResponse;
}

module.exports = { generateQuestion };
