export type LanguageCode = 'EN' | 'PL' | 'PT' | 'NO' | 'NE'; // ✅ Added NE

export const TRANSLATIONS = {
  EN: {
    taskTitle: "Task Complete?",
    taskSubtitle: "Verify physical installation.",
    yes: "YES",
    no: "NO",
    qtyTitle: "INPUT QUANTITY",
    qtySubtitle: "Type or Record (Cloud AI)",
    qtyPlaceholder: "e.g. 50 Meters",
    commentsTitle: "LOG COMMENTS",
    commentsSubtitle: "Report delays or issues.",
    commentsPlaceholder: "Describe issues...",
    micIdle: "TAP TO RECORD",
    micActive: "RECORDING...",
    next: "NEXT STEP >>",
    review: "REVIEW REPORT >>",
    upload: "UPLOAD TO ACC",
    cancel: "CANCEL / EDIT",
    success: "Report Received!",
    missing: "Data Missing"
  },
  PL: {
    taskTitle: "Zadanie Zakończone?",
    taskSubtitle: "Potwierdź instalację fizyczną.",
    yes: "TAK",
    no: "NIE",
    qtyTitle: "WPROWADŹ ILOŚĆ",
    qtySubtitle: "Wpisz lub Nagraj (AI)",
    qtyPlaceholder: "np. 50 Metrów",
    commentsTitle: "UWAGI",
    commentsSubtitle: "Zgłoś opóźnienia lub problemy.",
    commentsPlaceholder: "Opisz problem...",
    micIdle: "NAGRAJ",
    micActive: "NAGRYWANIE...",
    next: "DALEJ >>",
    review: "PODSUMOWANIE >>",
    upload: "WYŚLIJ DO ACC",
    cancel: "ANULUJ / EDYCJA",
    success: "Raport Otrzymany!",
    missing: "Brak Danych"
  },
  PT: {
    taskTitle: "Tarefa Concluída?",
    taskSubtitle: "Verificar instalação física.",
    yes: "SIM",
    no: "NÃO",
    qtyTitle: "INSERIR QUANTIDADE",
    qtySubtitle: "Digite ou Grave (IA Nuvem)",
    qtyPlaceholder: "ex. 50 Metros",
    commentsTitle: "OBSERVAÇÕES",
    commentsSubtitle: "Relatar atrasos ou problemas.",
    commentsPlaceholder: "Descreva o problema...",
    micIdle: "GRAVAR",
    micActive: "GRAVANDO...",
    next: "PRÓXIMO >>",
    review: "REVISAR >>",
    upload: "ENVIAR P/ ACC",
    cancel: "CANCELAR / EDITAR",
    success: "Relatório Recebido!",
    missing: "Dados em Falta"
  },
  NO: {
    taskTitle: "Oppgave Fullført?",
    taskSubtitle: "Verifiser fysisk installasjon.",
    yes: "JA",
    no: "NEI",
    qtyTitle: "ANGI MENGDE",
    qtySubtitle: "Skriv eller Ta opp (Sky AI)",
    qtyPlaceholder: "f.eks. 50 Meter",
    commentsTitle: "KOMMENTARER",
    commentsSubtitle: "Rapporter forsinkelser/feil.",
    commentsPlaceholder: "Beskriv problemet...",
    micIdle: "TA OPP",
    micActive: "TAR OPP...",
    next: "NESTE >>",
    review: "SE OVER >>",
    upload: "LAST OPP TIL ACC",
    cancel: "AVBRYT / ENDRE",
    success: "Rapport Mottatt!",
    missing: "Mangler Data"
  },
  NE: { // ✅ NEPALI TRANSLATION
    taskTitle: "काम सकियो?", // Kam sakiyo?
    taskSubtitle: "भौतिक जडान पुष्टि गर्नुहोस्", // Bhautik jadan pusti...
    yes: "हो", // Ho (Yes)
    no: "होइन", // Hoina (No)
    qtyTitle: "परिमाण राख्नुहोस्", // Pariman rakhnuhos
    qtySubtitle: "टाइप वा रेकर्ड (Cloud AI)",
    qtyPlaceholder: "उदाहरण: ५० मिटर",
    commentsTitle: "टिप्पणी लेख्नुहोस्",
    commentsSubtitle: "ढिलाइ वा समस्या रिपोर्ट गर्नुहोस्",
    commentsPlaceholder: "समस्या वर्णन गर्नुहोस्...",
    micIdle: "रेकर्ड गर्नुहोस्",
    micActive: "रेकर्ड हुँदैछ...",
    next: "अर्को चरण >>",
    review: "रिपोर्ट हेर्नुहोस् >>",
    upload: "ACC मा पठाउनुहोस्",
    cancel: "रद्द / सम्पादन",
    success: "रिपोर्ट प्राप्त भयो!",
    missing: "डाटा छुटेको छ"
  }
};