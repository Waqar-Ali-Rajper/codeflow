# 🚀 CodeFlow — Autonomous Code Review Agent

**Built for the Gemini 3 Hackathon**

CodeFlow is an AI-powered autonomous code review and debugging system that leverages **Gemini 3 API** to analyze, fix, test, and verify code quality in real-time. It features a beautiful glassmorphism UI with animated particle backgrounds and provides a complete code quality pipeline.

![CodeFlow Dashboard](https://img.shields.io/badge/Gemini_3-Powered-6366f1?style=for-the-badge&logo=google&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🎯 Problem Statement

Developers spend countless hours debugging code, writing tests, and performing code reviews. Manual code review is:
- ⏱️ Time-consuming
- 🐛 Prone to missing critical bugs
- 🔄 Repetitive and tedious
- 📉 Inconsistent in quality

**CodeFlow solves this** by providing an autonomous AI agent powered by Gemini 3 that analyzes code deeply, finds all bugs, auto-fixes them, generates comprehensive tests, and verifies the quality — all in seconds.

---

## ✨ Key Features

### 🔍 **Deep Code Analysis**
- Multi-pass analysis by Gemini 3 to detect bugs, vulnerabilities, and code smells
- Categorizes issues by severity: Critical, High, Medium, Low
- Line-by-line bug detection with detailed explanations

### 🔧 **Autonomous Auto-Fix**
- Automatically generates corrected code for all detected bugs
- Preserves code structure and comments
- Provides before/after comparisons with explanations

### 🧪 **Intelligent Test Generation**
- Generates comprehensive test cases (pytest/unittest format)
- Covers happy paths, edge cases, error cases, and security scenarios
- Produces runnable test code

### 🛡️ **Quality Verification**
- Re-analyzes fixed code to confirm all bugs are resolved
- Provides quality score (0-100) with animated progress ring
- Identifies any remaining issues

### 🎨 **Modern UI/UX**
- Dark futuristic theme with glassmorphism panels
- Animated particle background system
- Pipeline progress indicator (Analyze → Fix → Test → Verify)
- Expandable bug cards with smooth animations
- Line-numbered code editor
- Real-time loading states and toast notifications

---

## 🛠️ Tech Stack

**Backend:**
- Flask (Python web framework)
- Google Generative AI (Gemini 3 Flash)
- Python-dotenv (environment management)

**Frontend:**
- HTML5 / CSS3 / Vanilla JavaScript
- Custom particle system with Canvas API
- Glassmorphism design with backdrop filters
- CSS animations and transitions

**Fonts:**
- Syne (headings)
- Outfit (body text)
- JetBrains Mono (code)

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Gemini API Key ([Get it from AI Studio](https://aistudio.google.com/))

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/codeflow.git
cd codeflow
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure API Key
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run the Server
```bash
python app.py
```

### Step 5: Open in Browser
Navigate to: `http://127.0.0.1:5000`

---

## 🎮 Usage

### 1️⃣ **Analyze Code**
- Paste your code in the editor (supports Python, JavaScript, Java, C++, TypeScript)
- Click "Analyze Code" or press **Ctrl+Enter**
- View detected bugs with severity levels

### 2️⃣ **Auto-Fix Bugs**
- Click "Auto-Fix" button after analysis
- Review the fixed code with side-by-side comparison
- Copy or use the fixed code directly

### 3️⃣ **Generate Tests**
- Click "Gen Tests" to generate comprehensive test cases
- Review test coverage (happy path, edge cases, errors, security)
- Copy the test code for your project

### 4️⃣ **Verify Quality**
- Click "Verify Fix" to re-analyze the fixed code
- View quality score (0-100) with animated ring
- Confirm all bugs are resolved

---

## 🏗️ Project Structure

```
codeflow/
├── app.py                  # Flask backend with 5 API routes
├── requirements.txt        # Python dependencies
├── .env                    # API key configuration
├── templates/
│   └── index.html          # Frontend dashboard
└── static/
    ├── css/
    │   └── style.css       # Glassmorphism theme with animations
    └── js/
        └── app.js          # Particle system + API calls + UI logic
```

---

## 🎯 How Gemini 3 is Used

CodeFlow leverages **Gemini 3 Flash** across four core autonomous workflows:

### 1. **Code Analysis** (`/api/analyze`)
- Gemini performs deep multi-pass analysis
- Detects syntax errors, logic bugs, security vulnerabilities, performance issues
- Returns structured JSON with bug details, severity, line numbers, and fixes

### 2. **Auto-Fix** (`/api/fix`)
- Gemini receives the original code + detected bugs
- Generates complete corrected code
- Preserves structure while fixing all issues

### 3. **Test Generation** (`/api/generate-tests`)
- Gemini analyzes code logic and edge cases
- Generates comprehensive pytest/unittest test suite
- Covers normal flows, edge cases, error handling, and security

### 4. **Quality Verification** (`/api/verify`)
- Gemini re-analyzes the fixed code
- Confirms bug resolution
- Provides quality score and remaining issues (if any)

**Why Gemini 3 Flash?**
- Fast response times for real-time UX
- Large context window (1M tokens) handles entire codebases
- Strong reasoning capabilities for accurate bug detection
- Available in free tier for hackathon development

---

## 🎨 Design Philosophy

**Theme:** Dark Futuristic with Glassmorphism

**Key Visual Elements:**
- Animated particle background with connecting lines
- Glass-effect panels with backdrop blur
- Cyan (#22d3ee) and Indigo (#6366f1) accent colors
- Smooth animations using cubic-bezier easing
- Staggered reveal animations for cards
- Quality score ring with animated SVG stroke

**UX Principles:**
- Immediate visual feedback (loading states, toasts)
- Progressive disclosure (expandable bug cards)
- Keyboard shortcuts (Ctrl+Enter to analyze)
- Copy-to-clipboard functionality
- Mobile-responsive design

---

## 🏆 Hackathon Submission

**Event:** Gemini 3 Global Hackathon  
**Category:** AI-Powered Productivity Tools  
**Built by:** [Your Name]

### Innovation Highlights:
✅ **Autonomous multi-step pipeline** (not just a chat interface)  
✅ **Real-time code quality verification** with scoring  
✅ **Production-grade UI/UX** with custom animations  
✅ **Comprehensive test generation** (happy path + edge cases + security)  
✅ **Full stack integration** (Flask backend + vanilla JS frontend)

### Gemini 3 Integration:
- Uses Gemini 3 Flash API for all core features
- Demonstrates structured output parsing (JSON responses)
- Multi-turn reasoning (analyze → fix → verify loop)
- Complex prompt engineering for accurate bug detection

---

## 📊 Technical Execution

### Backend (40% weight):
- ✅ Clean Flask architecture with 5 RESTful API routes
- ✅ Error handling and validation
- ✅ JSON response parsing and cleanup
- ✅ Environment-based configuration

### Frontend (40% weight):
- ✅ Custom particle animation system (Canvas API)
- ✅ Glassmorphism design with CSS variables
- ✅ State management for multi-step pipeline
- ✅ Dynamic DOM rendering with animations
- ✅ Keyboard shortcuts and accessibility

### Gemini Integration (20% weight):
- ✅ Intelligent prompt engineering for structured outputs
- ✅ Multi-pass code analysis
- ✅ Context-aware test generation
- ✅ Quality verification with scoring

---

## 🚀 Future Enhancements

- [ ] Support for more languages (Rust, Go, Swift, Kotlin)
- [ ] GitHub integration (analyze PRs automatically)
- [ ] Team collaboration features
- [ ] Code diff visualization
- [ ] Export reports as PDF
- [ ] VS Code extension
- [ ] CI/CD pipeline integration

---

## 📹 Demo Video

[Link to demo video will be added here]

---

## 📄 License

MIT License - feel free to use and modify!

---

## 🙏 Acknowledgments

- Built with **Gemini 3 API** by Google DeepMind
- Inspired by the need for faster, more accurate code reviews
- Thanks to the Gemini 3 Hackathon organizers

---

## 📧 Contact

- **GitHub:** https://github.com/Waqar-Ali-Rajper
- **Email:** Wa6562637@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/waqar-ali-384081251

---

**⭐ If you found CodeFlow useful, please star this repository!**