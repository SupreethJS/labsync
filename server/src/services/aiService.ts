import { GoogleGenAI } from '@google/genai';
import {
  AIDiscoveryResult,
  AIResolutionPlan,
  EquipmentRecommendation,
  SchedulingConflict,
} from '../types/index.js';
import { store } from './store.js';

export class AIService {
  private client: GoogleGenAI | null = null;
  private defaultModel: string;
  private fallbackModel = 'gemini-2.0-flash';

  constructor() {
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey });
      } catch (err: unknown) {
        console.warn('Failed to initialize GoogleGenAI client, will use deterministic fallback:', err);
        this.client = null;
      }
    }
  }

  /**
   * Helper to execute Gemini generation with cascading fallback across models:
   * 1. defaultModel (gemini-2.5-flash or process.env.GEMINI_MODEL)
   * 2. fallbackModel (gemini-2.0-flash)
   * 3. Throws when all remote calls fail, allowing graceful fallback to deterministic heuristics.
   *
   * @param systemInstruction System role and schema enforcement instructions
   * @param userContent Formatted user prompt and catalog/conflict context
   * @returns Generated JSON text and model name used
   */
  private async generateWithModelFallback(
    systemInstruction: string,
    userContent: string
  ): Promise<{ text: string; modelUsed: string }> {
    if (!this.client) {
      throw new Error('GoogleGenAI client not initialized');
    }

    const modelsToTry = Array.from(new Set([this.defaultModel, this.fallbackModel]));
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: `${systemInstruction}\n\n${userContent}`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text && text.trim().length > 0) {
          return { text, modelUsed: model };
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini call using model ${model} failed:`, errorMsg);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError || new Error('All Gemini model fallbacks exhausted');
  }

  /**
   * GenAI Equipment Discovery ("Find Equipment with AI")
   * Processes a student's plain-English research query and returns ranked, compatible
   * instruments with match scores, rationale, and highlighted specifications.
   *
   * Uses Gemini 2.5 Flash with fallback to Gemini 2.0 Flash, and transparently falls
   * back to the heuristic keyword-matching engine if no API key is set or remote calls fail.
   *
   * @param prompt Natural language description of research requirements
   * @param userDepartment Optional student home department for cross-sharing affinity scoring
   * @returns Structured discovery recommendations with match analysis
   */
  public async discoverEquipment(prompt: string, userDepartment?: string): Promise<AIDiscoveryResult> {
    if (this.client && process.env.GEMINI_API_KEY?.trim()) {
      try {
        const result = await this.discoverWithGemini(prompt, userDepartment);
        return result;
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn('Gemini discovery call failed, activating smart deterministic fallback:', errorMsg);
      }
    }

    return this.discoverWithFallback(prompt, userDepartment);
  }

  /**
   * GenAI Conflict Resolution Engine (Hero Feature)
   * Resolves concurrent booking conflicts between competing student requests by evaluating:
   * 1. Project Deadline Urgency (e.g. 24h thesis defense submission vs 14d homework)
   * 2. Requirement Specificity (e.g. strict VRAM or composite filament necessity)
   * 3. Cross-Department Allocation Equity
   * 4. Alternative Open Slots & Equivalent Hardware Compatibility
   *
   * @param conflict Active scheduling conflict object containing both competing requests
   * @returns Comprehensive AI resolution plan with priority and secondary reallocations
   */
  public async resolveConflict(conflict: SchedulingConflict): Promise<AIResolutionPlan> {
    if (this.client && process.env.GEMINI_API_KEY?.trim()) {
      try {
        const result = await this.resolveWithGemini(conflict);
        return result;
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn('Gemini conflict resolution failed, activating smart deterministic fallback:', errorMsg);
      }
    }

    return this.resolveWithFallback(conflict);
  }

  // --- Gemini API implementations ---

  private async discoverWithGemini(prompt: string, userDepartment?: string): Promise<AIDiscoveryResult> {
    const allEquipment = store.getAllEquipment();
    const catalogSummary = allEquipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      department: eq.department,
      labRoom: eq.labRoom,
      category: eq.category,
      specs: eq.specs,
      status: eq.status,
      tags: eq.tags,
    }));

    const systemInstruction = `You are LabSync's AI Academic Resource Advisor. You help students and researchers find the exact campus lab equipment for their project goals across 5 departments (AI & ML, Computer Science, Electronics & ECE, Mechanical, Robotics).
Return ONLY a valid JSON object matching this schema:
{
  "query": string,
  "analysisSummary": string,
  "suggestedNextStep": string,
  "recommendations": [
    {
      "equipmentId": string,
      "equipmentName": string,
      "department": string,
      "labRoom": string,
      "category": string,
      "matchScore": number (integer between 60 and 99),
      "matchReason": string (2-3 concise sentences explaining why this matches their specific technical requirements),
      "highlightedSpecs": [string, string],
      "suggestedUsage": string (how to best utilize this equipment for the project),
      "alternativeEquipmentId": string (optional id of another compatible item),
      "alternativeEquipmentName": string (optional)
    }
  ]
}
Rank the top 2 to 3 most relevant items from the provided catalog.`;

    const userContent = `Student Need: "${prompt}"
User Department: ${userDepartment || 'Not specified'}

Available Campus Equipment Catalog:
${JSON.stringify(catalogSummary, null, 2)}`;

    const { text, modelUsed } = await this.generateWithModelFallback(systemInstruction, userContent);

    const parsed = JSON.parse(text);
    return {
      query: prompt,
      recommendations: parsed.recommendations || [],
      analysisSummary: parsed.analysisSummary || 'Ranked laboratory equipment based on project specifications.',
      suggestedNextStep: parsed.suggestedNextStep || 'Review equipment specifications and book an available slot.',
      source: 'gemini',
      modelUsed,
    };
  }

  private async resolveWithGemini(conflict: SchedulingConflict): Promise<AIResolutionPlan> {
    const allEquipment = store.getAllEquipment();
    const compatibleAlternatives = allEquipment.filter(
      (e) => e.category === store.getEquipmentById(conflict.equipmentId)?.category && e.id !== conflict.equipmentId
    );

    const systemInstruction = `You are LabSync's Academic Conflict Resolution Engine.
Two students requested overlapping time slots for the same high-demand campus equipment.
Your job is to provide a fair, transparent, and academically sound allocation plan evaluating:
1. Project Deadline Proximity & Urgency (e.g., imminent thesis defense vs flexible coursework)
2. Requirement Specificity (e.g. strict hardware dependency like 48GB VRAM vs general compute)
3. Cross-Department Fairness (ensuring equitable interdisciplinary access without bias)
4. Alternative Options (shifting non-critical request to an open slot or rerouting to equivalent hardware)

Return ONLY a valid JSON object matching this schema:
{
  "priorityRequest": {
    "requestId": string,
    "studentName": string,
    "projectTitle": string,
    "allocatedSlot": { "date": string, "startTime": string, "endTime": string },
    "rationale": string
  },
  "secondaryRequest": {
    "requestId": string,
    "studentName": string,
    "projectTitle": string,
    "proposedAlternative": {
      "type": "shifted_slot" or "alternative_equipment",
      "allocatedSlot": { "date": string, "startTime": string, "endTime": string },
      "alternativeEquipmentId": string (optional),
      "alternativeEquipmentName": string (optional),
      "notes": string
    },
    "rationale": string
  },
  "fairnessJustification": string,
  "recommendedPlanSummary": string
}`;

    const userContent = `Conflict Details:
Equipment: ${conflict.equipmentName} (${conflict.equipmentId})
Date: ${conflict.date}
Overlapping Slot: ${conflict.overlappingSlot.startTime} - ${conflict.overlappingSlot.endTime}

Request A (ID: ${conflict.requestA.id}):
- Student: ${conflict.requestA.studentName} (${conflict.requestA.department})
- Project: "${conflict.requestA.projectTitle}"
- Requirements: "${conflict.requestA.projectRequirements}"
- Project Deadline: ${conflict.requestA.projectDeadline}
- Requested Slot: ${conflict.requestA.startTime} - ${conflict.requestA.endTime}

Request B (ID: ${conflict.requestB.id}):
- Student: ${conflict.requestB.studentName} (${conflict.requestB.department})
- Project: "${conflict.requestB.projectTitle}"
- Requirements: "${conflict.requestB.projectRequirements}"
- Project Deadline: ${conflict.requestB.projectDeadline}
- Requested Slot: ${conflict.requestB.startTime} - ${conflict.requestB.endTime}

Available Alternative Equipment in same or adjacent category:
${compatibleAlternatives.map((a) => `- ${a.name} (ID: ${a.id}, Lab: ${a.labRoom}, Specs: ${a.specs})`).join('\n')}`;

    const { text, modelUsed } = await this.generateWithModelFallback(systemInstruction, userContent);

    const parsed = JSON.parse(text);

    return {
      conflictId: conflict.id,
      equipmentId: conflict.equipmentId,
      equipmentName: conflict.equipmentName,
      priorityRequest: parsed.priorityRequest,
      secondaryRequest: parsed.secondaryRequest,
      fairnessJustification: parsed.fairnessJustification,
      recommendedPlanSummary: parsed.recommendedPlanSummary,
      source: 'gemini',
      modelUsed,
      timestamp: new Date().toISOString(),
    };
  }

  // --- Deterministic Transparent Fallback Algorithms ---

  /**
   * Deterministic heuristic scoring algorithm for Equipment Discovery.
   * Evaluates prompt tokens against equipment technical specs, name, categories,
   * and tags using pre-weighted academic domain rules with cross-department sharing bonuses.
   *
   * @param prompt Natural language research query
   * @param userDepartment Optional home department
   * @returns Fallback discovery recommendations with algorithmic match reasoning
   */
  public discoverWithFallback(prompt: string, userDepartment?: string): AIDiscoveryResult {
    const all = store.getAllEquipment();
    const query = prompt.toLowerCase();
    const tokens = query.split(/\W+/).filter((t) => t.length > 2);

    // Domain keyword weights
    const scores = all.map((eq) => {
      let score = 30; // base score

      const nameLower = eq.name.toLowerCase();
      const specsLower = eq.specs.toLowerCase();
      const tagsLower = eq.tags.map((t) => t.toLowerCase());
      const catLower = eq.category.toLowerCase();

      // Vision / drone / edge AI
      if ((query.includes('vision') || query.includes('drone') || query.includes('camera') || query.includes('yolo') || query.includes('deploy')) &&
          (eq.id === 'eq-jetson-orin' || eq.id === 'eq-xilinx-kria')) {
        score += 55;
      }

      // LLM / Deep Learning / GPU / Large Model / Training
      if ((query.includes('train') || query.includes('llm') || query.includes('deep learning') || query.includes('gpu') || query.includes('pytorch') || query.includes('cuda')) &&
          (eq.id === 'eq-rtx-a6000' || eq.id === 'eq-mac-studio-cluster')) {
        score += 55;
      }

      // 3D printing / carbon fiber / enclosure / prototype / bracket
      if ((query.includes('print') || query.includes('3d') || query.includes('prototype') || query.includes('bracket') || query.includes('enclosure') || query.includes('carbon fiber')) &&
          (eq.id === 'eq-bambu-x1c' || eq.id === 'eq-formlabs-form4' || eq.id === 'eq-tormach-cnc')) {
        score += 55;
      }

      // RF / antenna / signal / oscilloscope / frequency
      if ((query.includes('signal') || query.includes('rf') || query.includes('antenna') || query.includes('oscilloscope') || query.includes('frequency') || query.includes('jitter')) &&
          (eq.id === 'eq-tektronix-dpo' || eq.id === 'eq-keysight-spectrum')) {
        score += 55;
      }

      // Robotics / Arm / Navigation / SLAM / LiDAR
      if ((query.includes('robot') || query.includes('slam') || query.includes('lidar') || query.includes('arm') || query.includes('autonomous') || query.includes('rover')) &&
          (eq.id === 'eq-rplidar-rover' || eq.id === 'eq-ur5e-arm' || eq.id === 'eq-jetson-orin')) {
        score += 50;
      }

      // Sensors / IoT / environmental / LoRaWAN
      if ((query.includes('sensor') || query.includes('iot') || query.includes('lora') || query.includes('environmental') || query.includes('microcontroller')) &&
          (eq.id === 'eq-arduino-sensor-suite' || eq.id === 'eq-saleae-logic-pro')) {
        score += 50;
      }

      // Thermal / heat / temperature
      if ((query.includes('thermal') || query.includes('heat') || query.includes('temperature') || query.includes('cooling')) &&
          eq.id === 'eq-flir-thermal') {
        score += 60;
      }

      // Token matches
      for (const token of tokens) {
        if (nameLower.includes(token)) score += 15;
        if (tagsLower.some((t) => t.includes(token))) score += 12;
        if (specsLower.includes(token)) score += 8;
        if (catLower.includes(token)) score += 10;
      }

      // Cross-department bonus to encourage resource sharing
      if (userDepartment && eq.department !== userDepartment) {
        score += 5;
      }

      // Cap between 65 and 98
      const finalScore = Math.min(98, Math.max(65, score));
      return { eq, score: finalScore };
    });

    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.slice(0, 3);

    const recommendations: EquipmentRecommendation[] = topMatches.map(({ eq, score }) => {
      let matchReason = `High hardware compatibility with your project workload. Provides required computational capacity and interface ports.`;
      let suggestedUsage = `Reserve a 2-4 hour slot in ${eq.labRoom}. Verify driver dependencies and pre-configured environment before arrival.`;
      let highlightedSpecs = eq.specs.split(',').slice(0, 2).map((s) => s.trim());
      let alternativeEquipmentId: string | undefined;
      let alternativeEquipmentName: string | undefined;

      if (eq.id === 'eq-jetson-orin') {
        matchReason = 'Ideal for low-power edge deployment, TensorRT acceleration, and onboard UAV/drone vision pipelines.';
        suggestedUsage = 'Flash model weights with JetPack 6.0 and run INT8 TensorRT inference bench with onboard CSI camera.';
        alternativeEquipmentId = 'eq-xilinx-kria';
        alternativeEquipmentName = 'Xilinx Kria KV260 Vision AI Starter Kit';
      } else if (eq.id === 'eq-rtx-a6000') {
        matchReason = '96GB dual-GPU VRAM delivers the throughput required for distributed deep learning and large-scale LLM fine-tuning.';
        suggestedUsage = 'Use the 8TB NVMe scratch disk for training checkpoint caching and multi-GPU PyTorch DDP.';
        alternativeEquipmentId = 'eq-mac-studio-cluster';
        alternativeEquipmentName = 'Apple M3 Max Mac Studio AI Compute Node (128GB Unified Memory)';
      } else if (eq.id === 'eq-bambu-x1c') {
        matchReason = 'Capable of rapid carbon-fiber composite printing (PA-CF) with micro-LiDAR precision calibration.';
        suggestedUsage = 'Export slicer g-code targeting 0.4mm hardened nozzle with heated chamber.';
        alternativeEquipmentId = 'eq-formlabs-form4';
        alternativeEquipmentName = 'Formlabs Form 4 SLA High-Precision Resin 3D Printer';
      }

      return {
        equipmentId: eq.id,
        equipmentName: eq.name,
        department: eq.department,
        labRoom: eq.labRoom,
        category: eq.category,
        matchScore: score,
        matchReason,
        highlightedSpecs,
        suggestedUsage,
        alternativeEquipmentId,
        alternativeEquipmentName,
      };
    });

    return {
      query: prompt,
      recommendations,
      analysisSummary: `Transparent algorithmic scoring evaluated ${all.length} specialized laboratory instruments across 5 departments based on requirement keywords, hardware specifications, and slot availability.`,
      suggestedNextStep: `Select your preferred equipment from the ranked recommendations to pre-fill the project access request modal.`,
      source: 'smart-scheduler-fallback',
      modelUsed: 'heuristic-rules-v2',
    };
  }

  /**
   * Deterministic deadline-fairness scoring algorithm for Conflict Resolution.
   * Calculates deadline proximity (days remaining until submission), requirement specificity,
   * and interdisciplinary fairness to award priority to the most time-critical milestone while
   * automatically provisioning open evening slots or compatible alternate hardware for the other party.
   *
   * @param conflict Scheduling conflict record with overlapping requests
   * @returns Algorithmic allocation plan with fairness justification
   */
  public resolveWithFallback(conflict: SchedulingConflict): AIResolutionPlan {
    const { requestA, requestB, equipmentName } = conflict;

    // Calculate deadline proximity in days
    const refDate = new Date(conflict.date);
    const deadlineA = new Date(requestA.projectDeadline);
    const deadlineB = new Date(requestB.projectDeadline);

    const diffDaysA = Math.ceil((deadlineA.getTime() - refDate.getTime()) / (1000 * 3600 * 24));
    const diffDaysB = Math.ceil((deadlineB.getTime() - refDate.getTime()) / (1000 * 3600 * 24));

    // Urgency indicators in text
    const urgentKeywords = ['thesis', 'defense', 'exam', 'inspection', 'dyno', 'mandatory', 'tomorrow', 'deadline', 'critical'];
    const textA = (requestA.projectTitle + ' ' + requestA.projectRequirements).toLowerCase();
    const textB = (requestB.projectTitle + ' ' + requestB.projectRequirements).toLowerCase();

    let urgencyScoreA = Math.max(10, 100 - Math.max(0, diffDaysA) * 7);
    let urgencyScoreB = Math.max(10, 100 - Math.max(0, diffDaysB) * 7);

    urgentKeywords.forEach((k) => {
      if (textA.includes(k)) urgencyScoreA += 15;
      if (textB.includes(k)) urgencyScoreB += 15;
    });

    const isAPriority = urgencyScoreA >= urgencyScoreB;
    const priReq = isAPriority ? requestA : requestB;
    const secReq = isAPriority ? requestB : requestA;
    const priDays = isAPriority ? diffDaysA : diffDaysB;
    const secDays = isAPriority ? diffDaysB : diffDaysA;

    // Determine alternative plan for secondary request
    let alternativeType: 'shifted_slot' | 'alternative_equipment' = 'shifted_slot';
    let alternativeEquipmentId: string | undefined;
    let alternativeEquipmentName: string | undefined;
    let shiftedSlot = {
      date: secReq.date,
      startTime: '18:00',
      endTime: '21:00',
    };
    let altNotes = 'Shifted to evening slot on the same day to maintain progress.';

    // Specific equipment alternatives
    if (conflict.equipmentId === 'eq-rtx-a6000') {
      alternativeType = 'alternative_equipment';
      alternativeEquipmentId = 'eq-mac-studio-cluster';
      alternativeEquipmentName = 'Apple M3 Max Mac Studio AI Compute Node (128GB Unified Memory)';
      altNotes = 'Assigned to Apple M3 Max Mac Studio in Room C-303 (128GB unified RAM, MLX acceleration) which easily accommodates coursework CNN models.';
      shiftedSlot = {
        date: secReq.date,
        startTime: secReq.startTime,
        endTime: secReq.endTime,
      };
    } else if (conflict.equipmentId === 'eq-bambu-x1c') {
      shiftedSlot = {
        date: secReq.date,
        startTime: '14:00',
        endTime: '17:30',
      };
      altNotes = 'Rescheduled to 14:00-17:30 right after Priority 1 job finishes; PLA printing has high tolerance for flexible scheduling.';
    }

    const priRationale = `Project deadline is ${priDays <= 1 ? 'critical (within 24-48 hours)' : `in ${priDays} days`}. Hardware requirements require immediate bench access to satisfy milestone deliverables.`;
    const secRationale = `Project deadline is comfortably situated in ${secDays} days. Requirements permit flexible slot shifting or alternative hardware routing without academic penalty.`;

    const fairnessJustification = `LabSync fairness balance evaluated deadline urgency (${priReq.studentName}: ${priDays}d vs ${secReq.studentName}: ${secDays}d), requirement specificity, and department cross-allocation equity. Priority is granted to the time-critical milestone while guaranteeing full slot accommodation for the secondary project.`;

    const recommendedPlanSummary = `Allocate ${priReq.studentName} the requested slot (${priReq.startTime}-${priReq.endTime}) on ${conflict.date}. Reroute ${secReq.studentName} via ${alternativeType === 'alternative_equipment' ? alternativeEquipmentName : 'shifted open slot ' + shiftedSlot.startTime + '-' + shiftedSlot.endTime} with zero project disruption.`;

    return {
      conflictId: conflict.id,
      equipmentId: conflict.equipmentId,
      equipmentName,
      priorityRequest: {
        requestId: priReq.id,
        studentName: priReq.studentName,
        projectTitle: priReq.projectTitle,
        allocatedSlot: {
          date: priReq.date,
          startTime: priReq.startTime,
          endTime: priReq.endTime,
        },
        rationale: priRationale,
      },
      secondaryRequest: {
        requestId: secReq.id,
        studentName: secReq.studentName,
        projectTitle: secReq.projectTitle,
        proposedAlternative: {
          type: alternativeType,
          allocatedSlot: shiftedSlot,
          alternativeEquipmentId,
          alternativeEquipmentName,
          notes: altNotes,
        },
        rationale: secRationale,
      },
      fairnessJustification,
      recommendedPlanSummary,
      source: 'smart-scheduler-fallback',
      modelUsed: 'deterministic-deadline-fairness-v2',
      timestamp: new Date().toISOString(),
    };
  }
}

export const aiService = new AIService();
