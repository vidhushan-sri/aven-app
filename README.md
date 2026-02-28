# Aven - Verifiable Lead Quality Oracle

**Submission for EigenCloudContest**

Stop paying for fake leads. Get verifiable AI quality scores with cryptographic proof.

---

## **The Problem**

Traditional lead vendors lie:
- They claim leads are "decision-makers" when they're not
- They say leads have budget authority without verification
- No way to dispute or prove quality
- Businesses waste millions on bad leads

**Aven's solution:** Cryptographically verifiable AI scoring that can't be faked.

---

## **What Aven Does**

Aven is a **lead validation dashboard** that uses **AI running inside a Trusted Execution Environment (TEE)** to verify the quality of B2B sales leads with cryptographic proof.

Each lead is scored across **6 categories** for a total of **100 points**:

| **Category** | **Max Points** | **What It Checks** |
|---|---|---|
| **Email Quality** | 20 | Valid format, corporate domain, matches company |
| **Company Validation** | 15 | Real company, meets size threshold, target industry |
| **Contact Info** | 20 | Phone number + LinkedIn profile provided |
| **ICP Fit** | 20 | Company size 500-10K employees, target industry match |
| **AI Decision Maker** | 15 | EigenAI analyzes if job title = decision-maker |
| **AI Budget Authority** | 10 | EigenAI determines budget control (high/medium/low) |

- **≥80 points** = ACCEPTED ✅
- **<80 points** = REJECTED ❌

---

## **EigenCompute & EigenCloud**

### **What They Are**

**EigenCloud** = Platform providing verifiable AI infrastructure

**EigenCompute** = Trusted Execution Environment (TEE) service where code runs in secure, tamper-proof enclaves

**EigenAI** = AI inference service (Llama models) running inside TEEs that returns cryptographic proofs

### **How They Work in Aven**

**Your Agent on EigenCompute:**
- Deployed at: `104.196.63.225:3000`
- Runs in a **sealed TEE** (no one can see/modify the code)
- Every execution is **deterministic** (same input = same output = same proof)
- Agent wallet: `0x92Caa62FcB925e6e08EFB5167F98D52faaDc1faB`

**EigenAI for Scoring:**

The agent calls EigenAI twice per lead:

1. **Decision-Maker Analysis:**
   ```
   Prompt: "Is 'Head of People Analytics' at 12,000-employee company a decision-maker?"
   Response: "85 - Yes, they oversee analytics strategy and tool selection..."
   Proof: Cryptographic signature from EigenAI
   ```

2. **Budget Authority Analysis:**
   ```
   Prompt: "What's their budget authority for HR software?"
   Response: "high - At 12K employees, typically >$250K budget"
   Proof: Cryptographic signature from EigenAI
   ```

Each response includes:
- **Signature** - Cryptographic hash proving EigenAI generated this
- **Fingerprint** - The exact AI model version (`eigenai-llama@0.1.0`)
- **ID** - Unique request identifier

### **Why This Matters**

**Without TEE/Proofs:**
- "Trust me, this lead is a VP with $500K budget" ← Could be lying
- No way to verify or dispute

**With EigenCompute/EigenAI:**
- "Here's the AI analysis + cryptographic proof it ran in a TEE" ← Can't be faked
- Proof is verifiable on-chain
- Can dispute bad leads with hard evidence

---

## **Cryptographic Attestation**

Every validation returns a **TEE proof object:**

```json
{
  "platform": "EigenCompute",
  "appId": "tee-0x6a011e0076344f25cbca538d09e94145147375cf",
  "deterministicSeed": 465218603,
  "agentWallet": "0x92Caa62FcB925e6e08EFB5167F98D52faaDc1faB",
  "agentSignature": "0x00f97bcb060e8fed8514694dcce478117404fe78f9283945c009400f8665d4cd...",
  "eigenaiProofs": {
    "decisionMaker": {
      "signature": "2904ce4eef408c3f0fd66e8ddee5947a429a598e327cb3a1e13f8b77285ea0bc...",
      "fingerprint": "eigenai-llama@0.1.0+eigenai-llama",
      "id": "019c7d8b-8620-7ce1-9331-1f50c09bb8e6"
    },
    "budgetAuthority": {
      "signature": "fbb2c088d77c97219fbaeadb2d70e017cc1f7eb3ca6672c1894ee8618bbb7dd4...",
      "fingerprint": "eigenai-llama@0.1.0+eigenai-llama",
      "id": "019c7d8b-8c6e-7015-9de7-2f85e4e69978"
    }
  }
}
```

**This proves:**
- ✅ The AI analysis actually happened
- ✅ It ran in a secure TEE (can't be tampered with)
- ✅ Same inputs = same outputs (deterministic)
- ✅ Verifiable on-chain

---

## **How to Use Aven**

### **1. Lead Submission**

**Option A: Single Lead Form**
1. Go to **Validate** tab
2. Click **Single Lead**
3. Enter: First name, last name, email, company, job title, employee count, phone, LinkedIn
4. Click **Validate with Agent**
5. See instant results with score and decision

**Option B: Batch CSV Upload**
1. Go to **Validate** tab
2. Click **Batch Upload**
3. Drag/drop CSV with columns: `first_name`, `last_name`, `email`, `company`, `title`, `employee_count`, `phone`, `linkedin`
4. Watch progress bar as agent validates all leads
5. Review results table

### **2. View Lead Details**

1. Go to **All Leads** tab
2. Click any lead to open detailed modal
3. See:
   - Score breakdown with AI reasoning for each category
   - Full cryptographic proofs (signatures, fingerprints, IDs)
   - Complete TEE attestation

### **3. Analytics & Insights**

**Dashboard Tab** shows:
- Total validated, acceptance rate, average score
- Validation trends chart (accepted vs rejected over time)
- Acceptance/rejection reasons
- Recent validations
- Top performing vendor

**Vendors Tab** shows:
- Each vendor's acceptance rate and total spend
- API connections for ZoomInfo, Apollo, Clearbit, Lusha

### **4. CRM Integration**

1. Go to **All Leads** tab
2. Select leads using checkboxes
3. Click **Push to CRM**
4. Choose: HubSpot, Salesforce, or Dynamics 365
5. Enter API key
6. Click **Push Leads**

---

## **Technical Architecture**

```
User (Browser)
    ↓
Netlify (aven-app.netlify.app)
    ↓
Netlify Function (/api/proxy)
    ↓ (HTTPS → HTTP bridge)
Agent (104.196.63.225:3000 on EigenCompute TEE)
    ↓
EigenAI API (in TEE)
    ↓
Returns: Scores + Cryptographic Proofs
```

**Stack:**
- **Frontend:** React (single App.jsx file)
- **Styling:** Inline styles, DM Sans font
- **Storage:** localStorage (persists across refreshes)
- **Hosting:** Netlify
- **Backend:** Node.js agent on EigenCompute TEE
- **AI:** EigenAI Llama running in TEE

---

## **Dashboard Features**

### **📊 Dashboard Tab**
- Stat cards: Total validated, accepted %, avg score, disputed cost
- Validation trends chart: Accepted vs rejected over time
- Score trend: Average quality over time
- Acceptance reasons: Expandable breakdown
- Rejection reasons: Donut chart visualization
- Recent validations: Last 8 leads
- Top vendor: Best performing lead source

### **🛡️ Validate Tab**
- Batch upload: CSV drag/drop with progress tracking
- Single lead: Form with instant validation
- Real-time feedback on accept/reject decision

### **👥 All Leads Tab**
- Filterable table: All / Accepted / Rejected / Pushed
- Search: By name, email, company
- Bulk actions: Select multiple → Push to CRM
- Click lead → Detailed modal with full proofs

### **📦 Vendors Tab**
- Performance table: Acceptance rate, spend per vendor
- API connections: Configure vendor integrations

---

## **Lead Detail Modal**

Click any lead to see:

**Header:**
- Name, job title, company
- Score (e.g., 85/100) + Status (ACCEPTED/REJECTED)

**Info Grid:**
- Email, Company, Employees, Phone, LinkedIn

**Evaluation & Reasoning:**
- 6 score bars with visual progress indicators
- AI explanation for each category
- Final decision summary box

**Cryptographic Attestation:**
Terminal-style display showing:
- Platform (EigenCompute)
- App ID
- Agent signature
- Deterministic seed
- Agent wallet address
- EigenAI Decision-Maker proof (signature, fingerprint, ID)
- EigenAI Budget Authority proof (signature, fingerprint, ID)
- TEE verification status

---

## **CSV Format**

Required columns (all fields required):

```csv
first_name,last_name,email,company,title,employee_count,phone,linkedin
Sarah,Chen,sarah.chen@salesforce.com,Salesforce,Chief People Officer,10000,415-555-0199,linkedin.com/in/sarahchen
Maria,Rodriguez,maria.r@adobe.com,Adobe,VP of People,15000,408-555-0123,linkedin.com/in/mariarodriguez
```

**Tips for High Scores (80+):**
- Job title: Use senior HR titles (CPO, CHRO, VP of People, Head of People Analytics)
- Company size: 1,000 - 10,000 employees (sweet spot)
- Email: Must match company domain
- Contact: Provide both phone AND LinkedIn
- Company: Use recognized company names

---

## **Key Features**

✅ **Verifiable:** Every score has cryptographic proof  
✅ **Deterministic:** Same lead = same score every time  
✅ **Transparent:** See exact AI reasoning for each decision  
✅ **Batch Processing:** Validate hundreds of leads at once  
✅ **CRM Integration:** Push validated leads to HubSpot/Salesforce/Dynamics  
✅ **Analytics:** Track vendor performance, acceptance rates  
✅ **Disputes:** Built-in cost tracking for rejected leads  
✅ **Persistent Storage:** Leads saved across browser sessions  

---

---

## **Why Aven Wins**

1. **Real Problem:** Lead quality fraud costs businesses millions annually
2. **Verifiable AI:** Uses EigenAI TEE for trustless, cryptographically-proven scoring
3. **Complete Product:** Not just a demo - fully functional with analytics, CRM integration, batch processing
4. **Cryptographic Proofs:** Can dispute vendor charges with on-chain verifiable evidence
5. **Professional UI:** Clean, production-ready dashboard with charts and comprehensive analytics
6. **EigenCloud Integration:** Showcases the full power of TEE-based AI inference

---

## **The Value Proposition**

EigenCloud turns AI from **"trust me"** into **"prove it"** - perfect for lead validation where vendors have financial incentive to inflate quality claims.

With Aven, every quality score is backed by cryptographic proof that can be verified on-chain, making lead quality disputes objectively resolvable for the first time.

---
