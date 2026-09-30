from .base_agent import BaseAgent


class RiskTriageAgent(BaseAgent):
    """Specialized Agent responsible for clinical triage categorization (Tier 1-4) and emergency safety checks."""

    def __init__(self):
        super().__init__(
            name="RiskTriageAgent",
            description="Evaluates combined report and image observations to classify informational urgency into 4 standardized clinical decision support tiers."
        )

    # Urgent clinical red flag indicators
    CRITICAL_THRESHOLDS = {
        'hemoglobin': {'critical_low': 7.0, 'critical_high': 20.0},
        'platelets': {'critical_low': 20000, 'critical_high': 1000000},
        'fasting blood glucose': {'critical_low': 50, 'critical_high': 350},
        'serum creatinine': {'critical_high': 4.0},
        'white blood cells (wbc)': {'critical_low': 1500, 'critical_high': 30000}
    }

    def process(self, payload: dict) -> dict:
        abnormal_values = payload.get('abnormal_values', [])
        clinical_impressions = payload.get('clinical_impressions', [])
        report_findings = payload.get('report_findings', [])
        image_observations = payload.get('image_observations', [])

        critical_flags = []
        moderate_flags = []

        # Check numeric critical values
        for f in report_findings:
            param = f.get('parameter', '').lower()
            val_str = f.get('value', '').split()[0].replace(',', '')
            try:
                val = float(val_str)
                for crit_param, thresholds in self.CRITICAL_THRESHOLDS.items():
                    if crit_param in param:
                        if 'critical_low' in thresholds and val < thresholds['critical_low']:
                            critical_flags.append(f"Severely depressed {f['parameter']}: {val_str}")
                        elif 'critical_high' in thresholds and val > thresholds['critical_high']:
                            critical_flags.append(f"Critically elevated {f['parameter']}: {val_str}")
            except (ValueError, IndexError):
                pass

        # Check impressions for urgency keywords
        for imp in clinical_impressions:
            kw = imp.get('keyword', '').lower()
            if kw in ['pneumonia', 'pleural effusion', 'fracture']:
                moderate_flags.append(f"Potential {imp.get('impression', kw)}")
            elif kw in ['pneumothorax', 'hemorrhage', 'pulmonary embolism']:
                critical_flags.append(f"Acute emergency indicator detected: {imp.get('impression', kw)}")

        # Determine Triage Tier
        if critical_flags:
            triage_level = "Tier 4: Emergency Warning"
            triage_color = "rose"
            urgency_rationale = (
                "Critical or potentially life-threatening biomarker deviations / acute findings detected. "
                "Immediate medical evaluation at an emergency department or urgent care facility is strongly advised."
            )
            action_recommended = "Seek immediate emergency medical attention or call emergency services."
        elif len(abnormal_values) >= 2 or moderate_flags:
            triage_level = "Tier 3: Prompt Medical Attention"
            triage_color = "orange"
            urgency_rationale = (
                "Multiple clinically significant biomarker deviations or notable radiological observations identified. "
                "These findings warrant a prompt in-person consultation with a physician within 24–48 hours."
            )
            action_recommended = "Schedule a prompt consultation with your doctor or attending specialist."
        elif len(abnormal_values) == 1:
            triage_level = "Tier 2: Discuss with Doctor"
            triage_color = "amber"
            urgency_rationale = (
                "A mild deviation from standard reference ranges was noted. This is often manageable and can be reviewed "
                "during your next routine physician appointment."
            )
            action_recommended = "Discuss this specific finding during your next scheduled routine appointment."
        else:
            triage_level = "Tier 1: General Information"
            triage_color = "emerald"
            urgency_rationale = (
                "All parsed biomarkers appear within standard reference intervals and no acute focal abnormalities were highlighted. "
                "Maintain routine preventive healthcare visits."
            )
            action_recommended = "Routine preventive health monitoring; no acute flags identified."

        return {
            'triage_level': triage_level,
            'triage_color': triage_color,
            'urgency_rationale': urgency_rationale,
            'action_recommended': action_recommended,
            'critical_flags': critical_flags,
            'moderate_flags': moderate_flags,
            'emergency_disclaimer': (
                "DISCLAIMER: This risk triage categorization is an educational decision-support estimate generated by artificial intelligence. "
                "It is NOT a medical diagnosis. If you are currently experiencing chest pain, difficulty breathing, sudden weakness, severe bleeding, "
                "or any other acute symptoms, immediately call your local emergency phone number or go to the nearest emergency room."
            )
        }
