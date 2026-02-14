import { useLanguage, type Language } from "./context/LanguageContext";

const dictionaries = {
  fr: {
    appName: "IrriSmart",
    tagline: "Conseil d'irrigation intelligent",
    languageLabel: "Langue",
    nav: {
      dashboard: "Dashboard",
      sensors: "Capteurs",
      alerts: "Alertes",
      reports: "Rapports"
    },
    common: {
      loading: "Chargement...",
      error: "Impossible de charger les données.",
      retry: "Réessayer",
      activePlot: "Parcelle active",
      season: "Saison",
      crop: "Culture",
      dataConfidence: "Confiance données",
      reliability: "Fiabilité capteurs",
      freshness: "Fraîcheur",
      trendConsistency: "Cohérence tendances",
      minutes: "min",
      seasons: {
        winter: "Hiver",
        spring: "Printemps",
        summer: "Été",
        autumn: "Automne"
      },
      reliabilityStatus: {
        reliable: "Fiable",
        watch: "À surveiller",
        critical: "Critique"
      },
      consistencyStatus: {
        consistent: "Stable",
        mixed: "Mixte",
        volatile: "Volatile"
      },
      trendDirection: {
        increasing: "En hausse",
        decreasing: "En baisse",
        stable: "Stable"
      }
    },
    dashboard: {
      title: "Décision du jour",
      subtitle: "Irriguer aujourd'hui, ou attendre ?",
      farmLabel: "Exploitation",
      generatedLabel: "Dernière mise à jour",
      confidence: "Confiance",
      duration: "Durée",
      reasonLabel: "Raison",
      nextCheck: "Prochaine vérification",
      hours: "h",
      minutes: "min",
      actionIrrigate: "Irriguer",
      actionWait: "Attendre",
      snapshotTitle: "État du champ",
      metrics: {
        moisture: "Humidité du sol",
        temperature: "Température air",
        rain: "Pluie 24h",
        battery: "Batterie"
      },
      plotSectionTitle: "Parcelles et cultures",
      plotSectionSubtitle: "Changer de parcelle pour comparer les besoins",
      plotArea: "Surface",
      cropLabel: "Culture",
      soilLabel: "Sol",
      thresholds: "Seuil humidité",
      crops: {
        olive: "Olivier",
        citrus: "Agrumes",
        wheat: "Blé"
      },
      soils: {
        clay: "Argileux",
        loam: "Limoneux",
        sandy: "Sableux"
      },
      outlookTitle: "Prévision 5 jours",
      outlookNeed: "Besoin",
      outlookRain: "Pluie",
      outlookStress: "Stress thermique",
      levels: {
        low: "Faible",
        medium: "Moyen",
        high: "Élevé"
      },
      soilHealthTitle: "Santé du sol",
      soilHealthWhy: "Pourquoi ce score ?",
      soilHealthStatus: {
        healthy: "Healthy",
        watch: "Watch",
        degraded: "Degraded"
      },
      soilHealthParts: {
        moisture_stability: "Stabilité humidité",
        irrigation_balance: "Équilibre irrigation",
        temperature_stress: "Stress thermique",
        decision_consistency: "Cohérence décisions"
      },
      soilHealthReasons: {
        moisture_variability_high: "L'humidité varie fortement entre les jours.",
        irrigation_balance_off: "Fréquence d'irrigation parfois hors zone cible.",
        temperature_stress_frequent: "Plusieurs épisodes de chaleur au-dessus du seuil.",
        decision_timing_inconsistent: "Le timing de décision est parfois incohérent.",
        soil_health_stable: "Conditions globalement stables cette semaine."
      },
      factorsTitle: "Facteurs influençant la décision",
      factorLabels: {
        moisture_level: "Humidité actuelle",
        rain_probability: "Probabilité de pluie",
        heat_forecast: "Jours chauds à venir"
      },
      intelligenceTitle: "System Intelligence",
      decisionLogTitle: "Flux décision → impact",
      decisionLogSubtitle: "Historique court des décisions et effets",
      decisionOutcome: {
        positive: "Impact positif",
        neutral: "Impact neutre",
        negative: "Impact négatif"
      },
      decisionReasons: {
        decision_recover_moisture: "Correction déficit humidité",
        decision_hold_for_rain: "Attente pluie probable",
        decision_heat_preventive: "Prévention stress thermique",
        decision_monitor: "Surveillance active"
      },
      simulationTitle: "Simulation rapide",
      simulationSubtitle: "Impact estimé d'ici 24h",
      simulationBaseline: "Niveau actuel",
      simulationScenarios: {
        irrigate_today: "Si j'irrigue aujourd'hui",
        wait_24h: "Si j'attends 24h"
      },
      simulationMetrics: {
        estimatedMoisture: "Humidité estimée",
        estimatedHealth: "Santé estimée",
        deltaMoisture: "Impact humidité",
        deltaHealth: "Impact santé"
      },
      simulationSummaries: {
        sim_stabilize_moisture: "L'irrigation immédiate stabilise l'humidité pour les prochaines 24h.",
        sim_rain_could_cover: "La pluie annoncée peut couvrir une partie du besoin demain.",
        sim_dryness_risk: "Attendre augmente le risque d'assèchement si la pluie reste faible."
      },
      reasons: {
        severe_dryness: "Déficit d'humidité critique pour cette culture.",
        moderate_deficit: "Humidité sous la cible et faible pluie attendue.",
        rain_incoming: "Une pluie probable peut couvrir le besoin immédiat.",
        heat_pressure: "Chaleur prévue, mieux vaut prévenir le stress hydrique.",
        moisture_optimal: "Humidité actuelle suffisante pour aujourd'hui."
      }
    },
    sensors: {
      title: "Détails capteurs",
      subtitle: "Tendance sur les 14 derniers jours",
      soilChart: "Humidité du sol (%)",
      tempChart: "Température (°C)",
      rainChart: "Pluie (mm)",
      batteryChart: "Batterie (%)",
      intelligenceTitle: "Qualité des signaux",
      trendTitle: "Tendance",
      abnormal: "Anomalie",
      normal: "Normal",
      decisionFeedTitle: "Lien vers décision",
      decisionFeedPrefix: "Ces signaux alimentent la décision",
      decisionInputNotes: {
        decision_input_moisture_drop: "Baisse continue d'humidité détectée.",
        decision_input_inconsistent: "Tendances irrégulières, prudence recommandée.",
        decision_input_stable_signal: "Signaux cohérents avec la recommandation actuelle."
      },
      trendNotes: {
        trend_moisture_low: "Humidité sous le niveau cible",
        trend_moisture_high: "Humidité supérieure à la zone cible",
        trend_moisture_normal: "Humidité dans la plage attendue",
        trend_temperature_spike: "Pic de chaleur détecté",
        trend_temperature_normal: "Température dans la zone attendue",
        trend_rain_peak: "Pluie ponctuelle élevée",
        trend_rain_normal: "Pluie dans la normale",
        trend_battery_low: "Batterie capteur faible",
        trend_battery_ok: "Niveau batterie correct"
      }
    },
    alerts: {
      title: "Alertes",
      subtitle: "Liste priorisée des signaux terrain",
      empty: "Aucune alerte active.",
      source: "Source",
      sensor: "Capteur",
      impacts: {
        decision: "Impact décision",
        soil_health: "Impact santé sol",
        yield_risk: "Risque rendement"
      },
      impactLevel: {
        low: "Faible",
        medium: "Moyen",
        high: "Élevé"
      },
      openDecision: "Voir la décision",
      severities: {
        critical: "Critique",
        warning: "Attention",
        info: "Info"
      },
      sensorKeys: {
        soil_moisture: "Humidité sol",
        air_temperature: "Température",
        rain_mm: "Pluie",
        battery_level: "Batterie"
      },
      titles: {
        battery_drop: "Baisse de batterie",
        soil_too_dry: "Humidité critique",
        light_rain: "Pluie légère détectée",
        rain_window: "Fenêtre de pluie",
        soil_health_dip: "Dégradation santé du sol",
        heat_risk_window: "Fenêtre de chaleur",
        trend_shift: "Changement de tendance",
        all_stable: "Situation stable"
      },
      messages: {
        battery_drop_msg: "Le niveau batterie descend rapidement depuis 48h.",
        soil_too_dry_msg: "Le niveau d'humidité est sous le seuil recommandé pour cette parcelle.",
        light_rain_msg: "La pluie prévue peut réduire l'irrigation manuelle.",
        rain_window_msg: "Une probabilité de pluie élevée est attendue dans les prochaines 24h.",
        soil_health_dip_msg: "Le score santé du sol est faible, ajuster le rythme d'irrigation.",
        heat_risk_window_msg: "Un pic thermique est attendu, vérifier la décision du jour.",
        trend_shift_msg: "Les tendances capteurs changent, surveiller la cohérence des mesures.",
        all_stable_msg: "Aucun signal critique détecté pour la parcelle sélectionnée."
      }
    },
    reports: {
      title: "Rapports légers",
      subtitle: "Synthèse rapide pour suivi hebdomadaire",
      avgMoisture: "Humidité moyenne (7j)",
      avgTemp: "Température moyenne (7j)",
      totalRain: "Pluie totale (7j)",
      activeAlerts: "Alertes actives",
      recentHistory: "Historique récent",
      intelligenceTitle: "Niveau de confiance système",
      positiveRate: "Décisions positives",
      decisionSplit: "Répartition décisions",
      narrativeTitle: "Narratif de la semaine",
      narrativeObserved: "Conditions observées",
      narrativeDecisions: "Décisions prises",
      narrativeImpact: "Impact estimé",
      narrativeKeys: {
        report_observed_dry_trend: "Tendance de dessèchement sur la parcelle active.",
        report_observed_heat_rise: "Hausse thermique observée en cours de semaine.",
        report_observed_stable: "Conditions capteurs globalement stables.",
        report_decisions_proactive: "Décisions majoritairement proactives (irrigation préventive).",
        report_decisions_conservative: "Décisions prudentes, avec attente de la pluie.",
        report_decisions_balanced: "Décisions équilibrées entre irrigation et attente.",
        report_impact_positive: "Impact global positif sur la stabilité agronomique.",
        report_impact_watch: "Impact modéré, suivi renforcé recommandé.",
        report_impact_risk: "Impact à risque, ajustement rapide conseillé."
      },
      table: {
        date: "Date",
        soil: "Sol %",
        temperature: "°C",
        rain: "mm",
        battery: "Batterie %"
      }
    }
  },
  ar: {
    appName: "إري سمارت",
    tagline: "نظام ذكي لتوصيات الري",
    languageLabel: "اللغة",
    nav: {
      dashboard: "لوحة التحكم",
      sensors: "المستشعرات",
      alerts: "التنبيهات",
      reports: "التقارير"
    },
    common: {
      loading: "جاري التحميل...",
      error: "تعذر تحميل البيانات.",
      retry: "إعادة المحاولة",
      activePlot: "القطعة النشطة",
      season: "الموسم",
      crop: "المحصول",
      dataConfidence: "ثقة البيانات",
      reliability: "موثوقية المستشعرات",
      freshness: "حداثة البيانات",
      trendConsistency: "اتساق الاتجاهات",
      minutes: "د",
      seasons: {
        winter: "الشتاء",
        spring: "الربيع",
        summer: "الصيف",
        autumn: "الخريف"
      },
      reliabilityStatus: {
        reliable: "موثوق",
        watch: "تحت المراقبة",
        critical: "حرج"
      },
      consistencyStatus: {
        consistent: "متسق",
        mixed: "متباين",
        volatile: "متقلب"
      },
      trendDirection: {
        increasing: "صاعد",
        decreasing: "هابط",
        stable: "مستقر"
      }
    },
    dashboard: {
      title: "توصية اليوم",
      subtitle: "هل يجب الري اليوم؟ وكم المدة؟",
      farmLabel: "المزرعة",
      generatedLabel: "آخر تحديث",
      confidence: "درجة الثقة",
      duration: "المدة",
      reasonLabel: "السبب",
      nextCheck: "المراجعة القادمة",
      hours: "ساعة",
      minutes: "دقيقة",
      actionIrrigate: "قم بالري",
      actionWait: "انتظر",
      snapshotTitle: "حالة الحقل",
      metrics: {
        moisture: "رطوبة التربة",
        temperature: "درجة حرارة الهواء",
        rain: "أمطار 24 ساعة",
        battery: "البطارية"
      },
      plotSectionTitle: "القطع والمحاصيل",
      plotSectionSubtitle: "غيّر القطعة لمقارنة الاحتياجات",
      plotArea: "المساحة",
      cropLabel: "المحصول",
      soilLabel: "نوع التربة",
      thresholds: "حد الرطوبة",
      crops: {
        olive: "زيتون",
        citrus: "حوامض",
        wheat: "قمح"
      },
      soils: {
        clay: "طينية",
        loam: "لومية",
        sandy: "رملية"
      },
      outlookTitle: "توقعات 5 أيام",
      outlookNeed: "الحاجة",
      outlookRain: "المطر",
      outlookStress: "إجهاد الحرارة",
      levels: {
        low: "منخفض",
        medium: "متوسط",
        high: "مرتفع"
      },
      soilHealthTitle: "صحة التربة",
      soilHealthWhy: "لماذا هذه الدرجة؟",
      soilHealthStatus: {
        healthy: "جيدة",
        watch: "مراقبة",
        degraded: "متدهورة"
      },
      soilHealthParts: {
        moisture_stability: "استقرار الرطوبة",
        irrigation_balance: "توازن الري",
        temperature_stress: "إجهاد الحرارة",
        decision_consistency: "اتساق القرارات"
      },
      soilHealthReasons: {
        moisture_variability_high: "تذبذب الرطوبة مرتفع بين الأيام.",
        irrigation_balance_off: "وتيرة الري خارج النطاق المستهدف أحيانًا.",
        temperature_stress_frequent: "تكرر ارتفاع الحرارة فوق العتبة هذا الأسبوع.",
        decision_timing_inconsistent: "توقيت القرارات غير متسق في بعض الأيام.",
        soil_health_stable: "الظروف العامة مستقرة خلال الأسبوع."
      },
      factorsTitle: "العوامل المؤثرة في القرار",
      factorLabels: {
        moisture_level: "الرطوبة الحالية",
        rain_probability: "احتمال المطر",
        heat_forecast: "أيام الحرارة القادمة"
      },
      intelligenceTitle: "ذكاء النظام",
      decisionLogTitle: "تدفق القرار ← الأثر",
      decisionLogSubtitle: "سجل مختصر للقرارات وتأثيرها",
      decisionOutcome: {
        positive: "أثر إيجابي",
        neutral: "أثر محايد",
        negative: "أثر سلبي"
      },
      decisionReasons: {
        decision_recover_moisture: "معالجة نقص الرطوبة",
        decision_hold_for_rain: "الانتظار لهطول محتمل",
        decision_heat_preventive: "وقاية من الإجهاد الحراري",
        decision_monitor: "مراقبة نشطة"
      },
      simulationTitle: "محاكاة سريعة",
      simulationSubtitle: "تأثير متوقع خلال 24 ساعة",
      simulationBaseline: "الوضع الحالي",
      simulationScenarios: {
        irrigate_today: "إذا قمت بالري اليوم",
        wait_24h: "إذا انتظرت 24 ساعة"
      },
      simulationMetrics: {
        estimatedMoisture: "الرطوبة المتوقعة",
        estimatedHealth: "الصحة المتوقعة",
        deltaMoisture: "تغير الرطوبة",
        deltaHealth: "تغير الصحة"
      },
      simulationSummaries: {
        sim_stabilize_moisture: "الري اليوم يساعد على استقرار الرطوبة خلال اليوم القادم.",
        sim_rain_could_cover: "الأمطار المتوقعة قد تغطي جزءًا من الحاجة غدًا.",
        sim_dryness_risk: "الانتظار يزيد خطر الجفاف إذا بقي المطر ضعيفًا."
      },
      reasons: {
        severe_dryness: "عجز رطوبة حرج لهذا المحصول.",
        moderate_deficit: "الرطوبة أقل من الهدف مع توقع مطر ضعيف.",
        rain_incoming: "هطول محتمل قد يغطي الحاجة المباشرة.",
        heat_pressure: "ارتفاع الحرارة المتوقع يبرر ريًا وقائيًا.",
        moisture_optimal: "مستوى الرطوبة الحالي كافٍ لليوم."
      }
    },
    sensors: {
      title: "تفاصيل المستشعرات",
      subtitle: "اتجاهات آخر 14 يومًا",
      soilChart: "رطوبة التربة (%)",
      tempChart: "الحرارة (°م)",
      rainChart: "الأمطار (مم)",
      batteryChart: "البطارية (%)",
      intelligenceTitle: "جودة الإشارات",
      trendTitle: "الاتجاه",
      abnormal: "قيمة غير طبيعية",
      normal: "طبيعي",
      decisionFeedTitle: "الارتباط بالقرار",
      decisionFeedPrefix: "هذه الإشارات تدعم قرار اليوم",
      decisionInputNotes: {
        decision_input_moisture_drop: "تم رصد انخفاض مستمر في الرطوبة.",
        decision_input_inconsistent: "اتجاهات متذبذبة، يوصى بالحذر.",
        decision_input_stable_signal: "الإشارات متسقة مع التوصية الحالية."
      },
      trendNotes: {
        trend_moisture_low: "الرطوبة أقل من النطاق المستهدف",
        trend_moisture_high: "الرطوبة أعلى من النطاق المستهدف",
        trend_moisture_normal: "الرطوبة ضمن المدى المتوقع",
        trend_temperature_spike: "تم رصد قفزة حرارية",
        trend_temperature_normal: "الحرارة ضمن المدى المتوقع",
        trend_rain_peak: "هطول مرتفع مؤقت",
        trend_rain_normal: "الأمطار ضمن الطبيعي",
        trend_battery_low: "بطارية المستشعر منخفضة",
        trend_battery_ok: "مستوى البطارية جيد"
      }
    },
    alerts: {
      title: "التنبيهات",
      subtitle: "قائمة مرتبة حسب الأولوية",
      empty: "لا توجد تنبيهات نشطة.",
      source: "المصدر",
      sensor: "المستشعر",
      impacts: {
        decision: "تأثير القرار",
        soil_health: "تأثير صحة التربة",
        yield_risk: "مخاطر الإنتاج"
      },
      impactLevel: {
        low: "منخفض",
        medium: "متوسط",
        high: "مرتفع"
      },
      openDecision: "عرض القرار",
      severities: {
        critical: "حرج",
        warning: "تحذير",
        info: "معلومة"
      },
      sensorKeys: {
        soil_moisture: "رطوبة التربة",
        air_temperature: "الحرارة",
        rain_mm: "الأمطار",
        battery_level: "البطارية"
      },
      titles: {
        battery_drop: "انخفاض البطارية",
        soil_too_dry: "رطوبة منخفضة جدًا",
        light_rain: "رصد أمطار خفيفة",
        rain_window: "نافذة مطر",
        soil_health_dip: "تراجع صحة التربة",
        heat_risk_window: "نافذة حرارة",
        trend_shift: "تغير في الاتجاه",
        all_stable: "وضع مستقر"
      },
      messages: {
        battery_drop_msg: "مستوى البطارية ينخفض بسرعة خلال آخر 48 ساعة.",
        soil_too_dry_msg: "مستوى الرطوبة أقل من الحد الموصى به لهذه القطعة.",
        light_rain_msg: "الأمطار المتوقعة قد تقلل مدة الري اليدوي.",
        rain_window_msg: "احتمال هطول مطر مرتفع خلال 24 ساعة القادمة.",
        soil_health_dip_msg: "درجة صحة التربة منخفضة، يفضّل تعديل وتيرة الري.",
        heat_risk_window_msg: "ارتفاع حرارة متوقع، راجع قرار الري اليوم.",
        trend_shift_msg: "تم رصد تغير في الاتجاهات، يلزم متابعة الاتساق.",
        all_stable_msg: "لا توجد إشارات حرجة في القطعة المختارة."
      }
    },
    reports: {
      title: "تقارير خفيفة",
      subtitle: "ملخص سريع للمتابعة الأسبوعية",
      avgMoisture: "متوسط الرطوبة (7 أيام)",
      avgTemp: "متوسط الحرارة (7 أيام)",
      totalRain: "إجمالي الأمطار (7 أيام)",
      activeAlerts: "التنبيهات النشطة",
      recentHistory: "السجل الأخير",
      intelligenceTitle: "مستوى ثقة النظام",
      positiveRate: "القرارات الإيجابية",
      decisionSplit: "توزيع القرارات",
      narrativeTitle: "سرد الأسبوع",
      narrativeObserved: "الظروف المرصودة",
      narrativeDecisions: "القرارات المتخذة",
      narrativeImpact: "الأثر المتوقع",
      narrativeKeys: {
        report_observed_dry_trend: "تم رصد اتجاه جفاف في القطعة النشطة.",
        report_observed_heat_rise: "لوحظ ارتفاع حراري خلال الأسبوع.",
        report_observed_stable: "الظروف العامة مستقرة عبر المستشعرات.",
        report_decisions_proactive: "القرارات كانت استباقية في أغلب الأيام.",
        report_decisions_conservative: "القرارات كانت حذرة مع انتظار المطر.",
        report_decisions_balanced: "القرارات متوازنة بين الري والانتظار.",
        report_impact_positive: "الأثر العام إيجابي على استقرار الحقل.",
        report_impact_watch: "الأثر متوسط ويتطلب متابعة.",
        report_impact_risk: "الأثر يحمل مخاطر ويتطلب ضبطًا سريعًا."
      },
      table: {
        date: "التاريخ",
        soil: "التربة %",
        temperature: "°م",
        rain: "مم",
        battery: "البطارية %"
      }
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Language];

export function useI18n() {
  const { language } = useLanguage();
  return dictionaries[language];
}
