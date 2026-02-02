from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
import re

# --- App Setup ---
load_dotenv()
app = Flask(__name__)
CORS(app)

# --- Gemini API Setup ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.5-flash"


# ============================================================
# ROUTE 1: Serve Frontend
# ============================================================
@app.route("/")
def index():
    return render_template("index.html")


# ============================================================
# ROUTE 2: Analyze Code — Find Bugs
# ============================================================
@app.route("/api/analyze", methods=["POST"])
def analyze_code():
    data = request.get_json()
    code = data.get("code", "")
    language = data.get("language", "python")

    if not code.strip():
        return jsonify({"error": "Code khali hai. Pehle code paste karo."}), 400

    prompt = f"""
You are an expert code review agent. Analyze the following {language} code DEEPLY.

Find ALL bugs, vulnerabilities, performance issues, and code smell issues.

For EACH issue found, return a JSON object in this EXACT format:
[
  {{
    "id": 1,
    "severity": "critical" | "high" | "medium" | "low",
    "line": <line number>,
    "title": "Short title of the bug",
    "description": "Detailed explanation of what is wrong and WHY it is a problem",
    "original_code": "The exact buggy line or snippet",
    "fixed_code": "The corrected version of that line or snippet",
    "explanation": "Step by step explanation of how the fix works"
  }}
]

Rules:
- Be thorough. Check for: syntax errors, logic errors, security vulnerabilities, performance issues, edge cases, null/undefined checks, input validation, memory leaks, race conditions.
- If code is clean, return an empty array [].
- Return ONLY the JSON array. No extra text, no markdown backticks.

Code to analyze:
```{language}
{code}
```
"""

    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json\s*", "", raw)
        raw = re.sub(r"```\s*", "", raw)
        raw = raw.strip()
        bugs = json.loads(raw)
        if not isinstance(bugs, list):
            bugs = []
        return jsonify({"bugs": bugs, "total": len(bugs)})

    except json.JSONDecodeError:
        return jsonify({"error": "Gemini se response parse nahi hua. Dobara try karo."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# ROUTE 3: Auto-Fix All Bugs
# ============================================================
@app.route("/api/fix", methods=["POST"])
def fix_code():
    data = request.get_json()
    code = data.get("code", "")
    language = data.get("language", "python")
    bugs = data.get("bugs", [])

    if not code.strip():
        return jsonify({"error": "Code khali hai."}), 400

    bugs_summary = json.dumps(bugs, indent=2)

    prompt = f"""
You are an expert code fixing agent. You have been given the following {language} code and a list of bugs found in it.

Fix ALL the bugs and return the COMPLETE corrected code.

Rules:
- Return ONLY the fixed code. No explanations, no markdown, no backticks.
- Keep all original comments and structure intact.
- Only change what is necessary to fix the bugs.
- Make sure the fixed code is 100% functional and clean.

Original Code:
```{language}
{code}
```

Bugs Found:
{bugs_summary}

Return the fully fixed {language} code now:
"""

    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        fixed_code = response.text.strip()
        fixed_code = re.sub(r"```\w*\s*", "", fixed_code)
        fixed_code = re.sub(r"```\s*", "", fixed_code)
        fixed_code = fixed_code.strip()
        return jsonify({"fixed_code": fixed_code})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# ROUTE 4: Generate Test Cases
# ============================================================
@app.route("/api/generate-tests", methods=["POST"])
def generate_tests():
    data = request.get_json()
    code = data.get("code", "")
    language = data.get("language", "python")

    if not code.strip():
        return jsonify({"error": "Code khali hai."}), 400

    prompt = f"""
You are an expert test generation agent. Analyze the following {language} code and generate comprehensive test cases.

Generate tests that cover:
- Normal/happy path cases
- Edge cases (empty inputs, boundary values, null/None)
- Error cases (invalid inputs, exceptions)
- Security edge cases if applicable

Return a JSON object in this EXACT format:
{{
  "test_code": "<the full runnable test code as a string>",
  "test_cases": [
    {{
      "id": 1,
      "name": "Test case name",
      "description": "What this test checks",
      "category": "happy_path" | "edge_case" | "error_case" | "security",
      "expected": "What the expected outcome should be"
    }}
  ]
}}

Rules:
- For Python: use pytest style tests.
- For JavaScript: use plain describe/it style (no framework dependency).
- Return ONLY the JSON. No extra text, no markdown backticks.
- Make tests actually runnable against the provided code.

Code to test:
```{language}
{code}
```
"""

    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json\s*", "", raw)
        raw = re.sub(r"```\s*", "", raw)
        raw = raw.strip()
        result = json.loads(raw)
        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify({"error": "Test generation response parse nahi hua."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# ROUTE 5: Verify Fixed Code
# ============================================================
@app.route("/api/verify", methods=["POST"])
def verify_code():
    data = request.get_json()
    code = data.get("code", "")
    language = data.get("language", "python")

    prompt = f"""
You are a strict code verification agent. Re-analyze this {language} code one final time.

Check if there are ANY remaining bugs, issues, or vulnerabilities.

Return a JSON object:
{{
  "is_clean": true | false,
  "remaining_issues": [
    {{
      "severity": "critical" | "high" | "medium" | "low",
      "title": "Issue title",
      "description": "What is still wrong"
    }}
  ],
  "quality_score": <number 0-100>,
  "summary": "A short 1-2 sentence summary of the code quality"
}}

Return ONLY the JSON. No extra text.

Code to verify:
```{language}
{code}
```
"""

    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json\s*", "", raw)
        raw = re.sub(r"```\s*", "", raw)
        raw = raw.strip()
        result = json.loads(raw)
        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify({"error": "Verification response parse nahi hua."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# START SERVER
# ============================================================
if __name__ == "__main__":
    print("🚀 CodeFlow server chal raha hai: http://127.0.0.1:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)