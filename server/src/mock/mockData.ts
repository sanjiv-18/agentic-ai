import { AnalysisReport } from '../types';

export const MOCK_REPORT: AnalysisReport = {
  idea: 'An AI-based smart irrigation system that reads soil sensors and weather data, then doses water and nutrients per crop zone.',
  mode: 'patent',
  timestamp: new Date().toISOString(),
  priorArt: {
    references: [
      {
        id: 'US10,973,179',
        title: 'Precision irrigation system using machine learning and real-time sensor fusion',
        relevance: 87,
        abstract: 'A system and method for precision irrigation that employs machine learning models trained on historical weather and soil data to schedule and dose irrigation events per sub-field zone.',
        url: 'https://patentsview.org/patents/US10973179',
      },
      {
        id: 'US9,968,045',
        title: 'Automated soil moisture monitoring and irrigation control with nutrient delivery',
        relevance: 74,
        abstract: 'An automated agricultural control system combining soil moisture sensors, weather station data, and computerized nutrient delivery for crop-specific zone management.',
        url: 'https://patentsview.org/patents/US9968045',
      },
      {
        id: 'US11,277,984',
        title: 'Weather-adaptive crop water stress index irrigation scheduling',
        relevance: 61,
        abstract: 'A method for deriving a crop water stress index from remote sensing and weather forecast APIs to schedule variable-rate irrigation for heterogeneous field zones.',
        url: 'https://patentsview.org/patents/US11277984',
      },
    ],
  },
  noveltyDiff: {
    features: [
      { feature: 'Soil sensor reading (moisture, temperature, EC)', status: 'Covered', note: 'Widely disclosed in US9,968,045 and US10,973,179' },
      { feature: 'Real-time weather API integration', status: 'Covered', note: 'Disclosed in US11,277,984 and US10,973,179' },
      { feature: 'Per crop-zone water dosing', status: 'Covered', note: 'Present in US10,973,179' },
      { feature: 'AI/ML-based irrigation scheduling', status: 'Covered', note: 'Present in US10,973,179 using ML models' },
      { feature: 'Nutrient dosing per zone (fertigation)', status: 'Partial', note: 'US9,968,045 covers nutrient delivery but not AI-driven per-zone optimisation' },
      { feature: 'Federated learning across multiple farms', status: 'New', note: 'No prior art found for cross-farm federated model training in irrigation context' },
      { feature: 'Explainable AI recommendations with farmer override log', status: 'New', note: 'No prior art found for XAI + audit trail in precision irrigation' },
    ],
  },
  claimDraft: {
    independentClaim: 'Claim 1: A computer-implemented precision irrigation and fertigation system comprising: (a) a federated learning engine configured to aggregate anonymised soil-sensor and weather-data models from a plurality of geographically distributed farms without sharing raw farm data; (b) a per-zone nutrient optimisation module that generates AI-driven fertigation schedules for each crop zone based on outputs of the federated learning engine; and (c) an explainable AI recommendation layer that presents human-readable rationale for each irrigation and fertigation action, and records farmer override events in a tamper-evident audit log.',
    dependentClaims: [
      'Claim 2 (dependent on Claim 1): The system of Claim 1, wherein the federated learning engine applies differential privacy noise to model updates before aggregation, ensuring that no individual farm\'s raw data can be reconstructed from the shared model parameters.',
      'Claim 3 (dependent on Claim 1): The system of Claim 1, wherein the explainable AI recommendation layer surfaces SHAP (SHapley Additive exPlanations) feature-importance scores alongside each irrigation recommendation, enabling agronomists to audit and challenge model decisions.',
    ],
    summary: 'The draft claims focus on two novel features: cross-farm federated learning for irrigation models, and explainable AI with farmer override audit trails — both unaddressed by retrieved prior art.',
  },
  examiner: {
    objections: [
      {
        issue: 'Obviousness (35 USC § 103): Combining federated learning (well-known in privacy ML literature) with irrigation scheduling may be deemed obvious to a PHOSITA.',
        type: 'obviousness',
        severity: 'high',
        fix: 'Amend Claim 1 to recite a specific technical challenge unique to the agricultural IoT domain — e.g., heterogeneous sensor protocols, intermittent connectivity in rural areas — and show unexpected results (yield improvement data) in the specification.',
      },
      {
        issue: 'Clarity (35 USC § 112): "Tamper-evident audit log" is not defined in the claims; could read on any logging system.',
        type: 'clarity',
        severity: 'medium',
        fix: 'Define "tamper-evident" by reference to a cryptographic mechanism (e.g., hash-chaining or blockchain anchoring) in the claim language.',
      },
      {
        issue: 'Enablement (35 USC § 112): Specification must fully enable the federated learning engine across heterogeneous farm IoT environments.',
        type: 'enablement',
        severity: 'medium',
        fix: 'Add at least one worked example to the specification describing the communication protocol, aggregation frequency, and convergence criteria for the federated engine.',
      },
    ],
    recommendation: 'File with the independent claim narrowed to the federated learning + XAI combination, supported by experimental yield-improvement data. Consider a continuation for the broader AI-driven fertigation scope after establishing prior allowance.',
    gaps: [
      'No experimental data to rebut obviousness for federated learning + irrigation combination.',
      'The claims do not yet differentiate from US10,973,179 on the ML scheduling dimension — consider adding specifics of the federated architecture.',
      'Consider international filing (PCT) given the global applicability of the technology; conduct FTO analysis for key markets (US, EU, IN, BR).',
    ],
  },
};
