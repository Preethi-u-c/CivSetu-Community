export interface ServiceTranslationItem {
  name: string;
  category: string;
  department: string;
  description: string;
  eligibility: string;
  expectedTimeline: string;
  fee: string;
  requiredDocuments: string[];
}

export const SERVICES_TRANSLATIONS: Record<
  string,
  {
    kn: ServiceTranslationItem;
    hi: ServiceTranslationItem;
  }
> = {
  "SRV-LMC-WAT-001": {
    kn: {
      name: "ಹೊಸ ಪೈಪ್‌ಲೈನ್ ಕುಡಿಯುವ ನೀರಿನ ಸಂಪರ್ಕ",
      category: "ಕುಡಿಯುವ ನೀರು ಸೇವೆಗಳು",
      department: "ನೀರು ಸರಬರಾಜು ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್ ವಿಭಾಗ",
      description: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ನೀರು ವಿತರಣಾ ಜಾಲದಿಂದ ಶಾಶ್ವತ ಗೃಹ ಅಥವಾ ವಾಣಿಜ್ಯ ಬಳಕೆಯ ನಳದ ನೀರಿನ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಅರ್ಜಿ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಎಲ್ಲಾ 23 ವಾರ್ಡ್‌ಗಳಲ್ಲಿನ ಆಸ್ತಿ ಮಾಲೀಕರು ಅಥವಾ ಕಾನೂನುಬದ್ಧ ಬಾಡಿಗೆದಾರರು (ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿ ಚಾಲ್ತಿಯಲ್ಲಿರಬೇಕು).",
      expectedTimeline: "7 ಕೆಲಸದ ದಿನಗಳು",
      fee: "₹500 ಅರ್ಜಿ ಶುಲ್ಕ + ಮೀಟರ್ ಠೇವಣಿ",
      requiredDocuments: [
        "ಇತ್ತೀಚಿನ ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿಸಿದ ರಸೀದಿ",
        "ಖರೀದಿ ಪತ್ರ / ಕ್ರಯಪತ್ರ ಅಥವಾ ಇ-ಸ್ವತ್ತು ಖಾತಾ ಪ್ರತಿ (ನಮೂನೆ-3)",
        "ಅರ್ಜಿದಾರರ ಆಧಾರ್ ಕಾರ್ಡ್",
        "ಪಾಸ್‌ಪೋರ್ಟ್ ಅಳತೆಯ ಭಾವಚಿತ್ರ",
        "ಪ್ಲಂಬಿಂಗ್ ಪೈಪ್ ಮಾರ್ಗ ನಕ್ಷೆ",
      ],
    },
    hi: {
      name: "नया पाइपयुक्त पेयजल कनेक्शन",
      category: "जल सेवाएं",
      department: "जल आपूर्ति एवं इंजीनियरिंग अनुभाग",
      description: "लक्ष्मेश्वर नगर पालिका परिषद के जल वितरण नेटवर्क से स्थायी घरेलू या वाणिज्यिक नल जल आपूर्ति कनेक्शन हेतु आवेदन।",
      eligibility: "लक्ष्मेश्वर नगर पालिका के 23 वार्डों में कोई भी पंजीकृत संपत्ति मालिक अथवा वैध किरायेदार (संपत्ति कर चुकता होना चाहिए)।",
      expectedTimeline: "7 कार्य दिवस",
      fee: "₹500 आवेदन शुल्क + मीटर अमानत राशि",
      requiredDocuments: [
        "नवीनतम संपत्ति कर रसीद",
        "रजिस्ट्री/विक्रय पत्र अथवा ई-स्वथु खाता नकल (प्रपत्र-3)",
        "आवेदक का आधार कार्ड",
        "पासपोर्ट साइज फोटो",
        "प्लंबिंग पाइपलाइन रूट स्केच",
      ],
    },
  },
  "SRV-LMC-SAN-002": {
    kn: {
      name: "ಒಳಚರಂಡಿ (ಯುಜಿಡಿ) ಸ್ವಚ್ಛತೆ ಮತ್ತು ಹೂಳೆತ್ತುವಿಕೆ",
      category: "ನೈರ್ಮಲ್ಯ ಮತ್ತು ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
      department: "ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ ವಿಭಾಗ",
      description: "ಮುಚ್ಚಿಹೋದ ಒಳಚರಂಡಿ ಮ್ಯಾನ್‌ಹೋಲ್ ಸ್ವಚ್ಛಗೊಳಿಸಲು, ರಸ್ತೆಬದಿಯ ಚರಂಡಿ ಹೂಳೆತ್ತಲು ಅಥವಾ ಯಾಂತ್ರೀಕೃತ ವ್ಯಾಕ್ಯೂಮ್ ಜೆಟ್ಟಿಂಗ್‌ಗಾಗಿ ಸೇವಾ ವಿನಂತಿ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ 23 ವಾರ್ಡ್‌ಗಳ ಎಲ್ಲಾ ನಾಗರಿಕರು ಮತ್ತು ನಿವಾಸಿ ಸಂಘಗಳಿಗೆ ಮುಕ್ತವಾಗಿದೆ.",
      expectedTimeline: "24 ರಿಂದ 48 ಗಂಟೆಗಳು",
      fee: "ಉಚಿತ ಸೇವೆ",
      requiredDocuments: [
        "ವಾರ್ಡ್ ಸಂಖ್ಯೆ ಮತ್ತು ಬೀದಿ ಗುರುತು (ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್)",
        "ಚರಂಡಿ ಬ್ಲಾಕೇಜ್ / ಉಕ್ಕಿ ಹರಿಯುವ ಫೋಟೋ (ಐಚ್ಛಿಕ)",
        "ಸಂಪರ್ಕ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      ],
    },
    hi: {
      name: "भूमिगत सीवरेज (UGD) सफाई एवं गाद निकासी",
      category: "स्वच्छता एवं अपशिष्ट प्रबंधन",
      department: "सार्वजनिक स्वास्थ्य एवं स्वच्छता अनुभाग",
      description: "अवरुद्ध सीवरेज मैनहोल खोलने, सड़क किनारे नालियों की सफाई अथवा जेटिंग मशीन की मांग हेतु सेवा अनुरोध।",
      eligibility: "लक्ष्मेश्वर के सभी 23 वार्डों में रहने वाले सभी नागरिकों और आवासीय समितियों के लिए।",
      expectedTimeline: "24 से 48 घंटे",
      fee: "निःशुल्क",
      requiredDocuments: [
        "वार्ड नंबर एवं गली का लैंडमार्क स्थान",
        "नाली जाम होने की फोटो (वैकल्पिक)",
        "निवासी का संपर्क मोबाइल नंबर",
      ],
    },
  },
  "SRV-LMC-PROP-003": {
    kn: {
      name: "ಇ-ಸ್ವತ್ತು ಖಾತಾ ನಕಲು (ನಮೂನೆ-3) ಮತ್ತು ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ",
      category: "ಆಸ್ತಿ ಮತ್ತು ಖಾತಾ ಸೇವೆಗಳು",
      department: "ನಗರ ಕಂದಾಯ ಮತ್ತು ಖಾತಾ ಇಲಾಖೆ",
      description: "ನೋಂದಣಿ ಹಾಗೂ ಬ್ಯಾಂಕ್ ಸಾಲಗಳಿಗಾಗಿ ಪ್ರಮಾಣೀಕೃತ ಡಿಜಿಟಲ್ ಇ-ಸ್ವತ್ತು ನಮೂನೆ-3 ಆಸ್ತಿ ನಕಲು, ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ ಹಾಗೂ ವಿಭಜನೆ ನೀಡಿಕೆ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರ ನಗರ ಪುರಸಭಾ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ನೋಂದಾಯಿತ ಕ್ರಯಪತ್ರ, ದಾನಪತ್ರ ಅಥವಾ ವಾರಸುದಾರಿಕೆ ಹಕ್ಕು ಹೊಂದಿರುವ ಆಸ್ತಿ ಮಾಲೀಕರು.",
      expectedTimeline: "15 ಕೆಲಸದ ದಿನಗಳು",
      fee: "ಪ್ರತಿ ಪ್ರಮಾಣೀಕೃತ ಪ್ರತಿಯೊಂದಕ್ಕೆ ₹125",
      requiredDocuments: [
        "ನೋಂದಾಯಿತ ಕ್ರಯಪತ್ರ / ದಾನಪತ್ರ ಪ್ರತಿ",
        "ಹಿಂದಿನ ಚಾಲ್ತಿ ಆಸ್ತಿ ತೆರಿಗೆ ರಸೀದಿಗಳು",
        "13 ವರ್ಷಗಳ ಇಸಿ (Encumbrance Certificate - ನಮೂನೆ 15)",
        "ಮಾಲೀಕರ ಆಧಾರ್ ಕಾರ್ಡ್",
        "ಜಿಪಿಎಸ್ ಅಕ್ಷಾಂಶ-ರೇಖಾಂಶ ಹೊಂದಿರುವ ಇತ್ತೀಚಿನ ಕಟ್ಟಡ/ನಿವೇಶನದ ಫೋಟೋ",
      ],
    },
    hi: {
      name: "ई-स्वथु खाता प्रति (प्रपत्र-3) एवं नामांतरण प्रमाणपत्र",
      category: "संपत्ति एवं खाता सेवाएं",
      department: "नगर राजस्व एवं खाता विभाग",
      description: "रजिस्ट्री एवं बैंक ऋण हेतु प्रमाणित डिजिटल ई-स्वथु फॉर्म-3 संपत्ति अर्क, स्वामित्व नामांतरण तथा संपत्ति विभाजन।",
      eligibility: "लक्ष्मेश्वर नगर पालिका सीमा में पंजीकृत विक्रय पत्र, दान पत्र या उत्तराधिकार आदेश रखने वाले वैध संपत्ति मालिक।",
      expectedTimeline: "15 कार्य दिवस",
      fee: "₹125 प्रति प्रमाणित प्रति",
      requiredDocuments: [
        "पंजीकृत विक्रय विलेख / दान विलेख की प्रति",
        "अद्यतन संपत्ति कर भुगतान रसीदें",
        "13 वर्षों का भारमुक्त प्रमाणपत्र (EC Form 15)",
        "मालिक का आधार कार्ड",
        "GPS निर्देशांक के साथ नवीनतम भवन/प्लॉट का फोटो",
      ],
    },
  },
  "SRV-LMC-REG-004": {
    kn: {
      name: "ಜನನ ಮತ್ತು ಮರಣ ಪ್ರಮಾಣಪತ್ರ ವಿತರಣೆ ಹಾಗೂ ತಿದ್ದುಪಡಿ",
      category: "ಜನನ ಮತ್ತು ಮರಣ ನೋಂದಣಿ",
      department: "ಜನನ ಮತ್ತು ಮರಣಗಳ ಸಾರ್ವಜನಿಕ ನೊಂದಣಾಧಿಕಾರಿ",
      description: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭಾ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಸಂಭವಿಸುವ ಘಟನೆಗಳ ನೋಂದಣಿ ಮತ್ತು ಸರ್ಕಾರದ ಕ್ಯೂಆರ್ ಸೀಲ್ ಹೊಂದಿರುವ ದ್ವಿಭಾಷಾ (ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್) ಡಿಜಿಟಲ್ ಪ್ರಮಾಣಪತ್ರ ವಿತರಣೆ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರ ನಗರದ ಆಸ್ಪತ್ರೆಗಳು, ಹೆರಿಗೆ ಕೇಂದ್ರಗಳು ಅಥವಾ ಮನೆಗಳಲ್ಲಿ ಸಂಭವಿಸಿದ ಘಟನೆಗಳಿಗಾಗಿ ಪೋಷಕರು, ಸಂಗಾತಿ ಅಥವಾ ಕಾನೂನುಬದ್ಧ ವಾರಸುದಾರರು.",
      expectedTimeline: "3 ಕೆಲಸದ ದಿನಗಳು (21 ದಿನಗಳೊಳಗೆ ಉಚಿತ)",
      fee: "21 ದಿನಗಳೊಳಗೆ ಉಚಿತ; ನಂತರ ₹50 ಶಾಸನಬದ್ಧ ಶುಲ್ಕ",
      requiredDocuments: [
        "ಆಸ್ಪತ್ರೆಯ ನಮೂನೆ 1 (ಜನನ) ಅಥವಾ ನಮೂನೆ 2 (ಮರಣ)",
        "ಪೋಷಕರ / ಮೃತರ ಆಧಾರ್ ಕಾರ್ಡ್",
        "ಸ್ಮಶಾನ/ರುದ್ರಭೂಮಿ ರಸೀದಿ (ಮರಣ ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ)",
        "ಮಾಹಿತಿದಾರರ ವಿಳಾಸ ಪುರಾವೆ",
      ],
    },
    hi: {
      name: "जन्म एवं मृत्यु प्रमाणपत्र जारी करना व संशोधन",
      category: "जन्म एवं मृत्यु पंजीकरण",
      department: "जन्म एवं मृत्यु रजिस्ट्रार कार्यालय",
      description: "लक्ष्मेश्वर नगर पालिका सीमा में घटनाओं का पंजीकरण और सरकारी क्यूआर कोड युक्त द्विभाषी (कन्नड़/अंग्रेजी) डिजिटल प्रमाण पत्र डाउनलोड।",
      eligibility: "लक्ष्मेश्वर के अस्पतालों या निवास में घटित घटनाओं हेतु माता-पिता, जीवनसाथी अथवा निकटतम कानूनी संबंधी।",
      expectedTimeline: "3 कार्य दिवस (21 दिनों में निःशुल्क)",
      fee: "21 दिनों के भीतर निःशुल्क; उसके पश्चात ₹50 वैधानिक शुल्क",
      requiredDocuments: [
        "अस्पताल फॉर्म 1 (जन्म) अथवा फॉर्म 2 (मृत्यु)",
        "माता-पिता / मृतक का आधार कार्ड",
        "श्मशान/कब्रिस्तान रसीद (मृत्यु प्रमाण पत्र हेतु)",
        "सूचनादाता का पहचान एवं पता प्रमाण",
      ],
    },
  },
  "SRV-LMC-CERT-005": {
    kn: {
      name: "ವಾಣಿಜ್ಯ ವ್ಯಾಪಾರ ಪರವಾನಗಿ ವಿತರಣೆ ಮತ್ತು ವಾರ್ಷಿಕ ನವೀಕರಣ",
      category: "ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಪರವಾನಗಿಗಳು",
      department: "ವ್ಯಾಪಾರ ಪರವಾನಗಿ ಮತ್ತು ವಾಣಿಜ್ಯ ಕೋಶ",
      description: "ಕರ್ನಾಟಕ ಪುರಸಭೆ ಕಾಯ್ದೆಯಡಿ ವಾಣಿಜ್ಯ, ಉತ್ಪಾದನಾ, ಚಿಲ್ಲರೆ ಅಥವಾ ಆಹಾರ ಮಳಿಗೆಗಳನ್ನು ನಡೆಸಲು ಶಾಸನಬದ್ಧ ವ್ಯಾಪಾರ ಪರವಾನಗಿ ನೀಡಿಕೆ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರದಲ್ಲಿ ಅಂಗಡಿ, ಹೋಟೆಲ್, ಕ್ಲಿನಿಕ್ ಅಥವಾ ಸೇವಾ ಸಂಸ್ಥೆ ನಡೆಸುವ ಯಾವುದೇ ಉದ್ಯಮಿ, ಪಾಲುದಾರಿಕೆ ಅಥವಾ ಸಂಸ್ಥೆ.",
      expectedTimeline: "7 ಕೆಲಸದ ದಿನಗಳು",
      fee: "ವ್ಯಾಪಾರದ ಪ್ರಕಾರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ₹500 ರಿಂದ ₹3,000",
      requiredDocuments: [
        "ಅಂಗಡಿಯ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಅಥವಾ ಆಸ್ತಿ ತೆರಿಗೆ ರಸೀದಿ",
        "ಮಾಲೀಕರ ಆಧಾರ್ / ಪ್ಯಾನ್ ಕಾರ್ಡ್",
        "FSSAI ಪರವಾನಗಿ (ಆಹಾರ ಮಳಿಗೆಗಳಿಗೆ)",
        "ಅಗ್ನಿಶಾಮಕ ಸುರಕ್ಷತಾ ಪ್ರಮಾಣಪತ್ರ (> 500 ಚ.ಅಡಿ ಮಳಿಗೆಗಳಿಗೆ)",
        "ನಾಮಫಲಕದೊಂದಿಗೆ ಅಂಗಡಿಯ ಮುಂಭಾಗದ ಭಾವಚಿತ್ರ",
      ],
    },
    hi: {
      name: "व्यापार लाइसेंस जारी करना एवं वार्षिक नवीनीकरण",
      category: "प्रमाणपत्र एवं लाइसेंस",
      department: "व्यापार लाइसेंसिंग एवं वाणिज्यिक प्रकोष्ठ",
      description: "कर्नाटक नगर पालिका अधिनियम के तहत वाणिज्यिक, विनिर्माण, खुदरा या खाद्य प्रतिष्ठान संचालित करने की वैधानिक अनुमति।",
      eligibility: "लक्ष्मेश्वर में दुकान, भोजनालय, क्लिनिक अथवा सेवा प्रतिष्ठान चलाने वाला कोई भी व्यवसायी या फर्म।",
      expectedTimeline: "7 कार्य दिवस",
      fee: "व्यापार श्रेणी के अनुसार ₹500 से ₹3,000",
      requiredDocuments: [
        "दुकान का किरायानामा अथवा संपत्ति कर रसीद",
        "मालिक का आधार / पैन कार्ड",
        "FSSAI लाइसेंस (खाद्य प्रतिष्ठानों हेतु)",
        "अग्निशमन सुरक्षा अनापत्ति प्रमाणपत्र (500 वर्गफुट से अधिक)",
        "नाम पट्टिका सहित दुकान के सामने का फोटो",
      ],
    },
  },
  "SRV-LMC-APP-006": {
    kn: {
      name: "ಸಮುದಾಯ ಭವನ ಮತ್ತು ಪುರಸಭೆ ಮೈದಾನ ಸಾರ್ವಜನಿಕ ಕಾಯ್ದಿರಿಸುವಿಕೆ",
      category: "ಪುರಸಭೆ ಅರ್ಜಿಗಳು",
      department: "ನಗರ ಯೋಜನೆ ಮತ್ತು ಕಟ್ಟಡ ಅನುಮೋದನೆ",
      description: "ಮದುವೆ, ಪ್ರದರ್ಶನ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕಾರ್ಯಕ್ರಮಗಳಿಗಾಗಿ ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಕಲ್ಯಾಣ ಮಂಟಪ, ಬಯಲು ಪ್ರದರ್ಶನ ಮೈದಾನ ಅಥವಾ ಕ್ರೀಡಾಂಗಣ ಮುಂಗಡ ಬುಕಿಂಗ್.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರದ ಯಾವುದೇ ನಾಗರಿಕರು ಅಥವಾ ನೋಂದಾಯಿತ ಸಾಂಸ್ಕೃತಿಕ/ಸಾಮಾಜಿಕ ಸಂಸ್ಥೆಗಳು.",
      expectedTimeline: "2 ಕೆಲಸದ ದಿನಗಳು",
      fee: "ಕಲ್ಯಾಣ ಮಂಟಪಕ್ಕೆ ದಿನಕ್ಕೆ ₹5,000 + ₹2,000 ಮರುಪಾವತಿಸಬಹುದಾದ ಠೇವಣಿ",
      requiredDocuments: [
        "ಆಯೋಜಕರ ಆಧಾರ್ ಕಾರ್ಡ್",
        "ಸ್ಥಳೀಯ ನಿವಾಸಿ ಪುರಾವೆ",
        "ಶಬ್ದಮಾಲಿನ್ಯ ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್ ನಿಷೇಧ ಪಾಲನೆಯ ಮುಚ್ಚಳಿಕೆ ಪತ್ರ",
        "ಪೊಲೀಸ್ ಠಾಣೆಯ ಮಾಹಿತಿ ಪ್ರತಿ",
      ],
    },
    hi: {
      name: "सामुदायिक भवन एवं नगर पालिका मैदान सार्वजनिक बुकिंग",
      category: "नगर पालिका आवेदन",
      department: "नगर नियोजन एवं भवन स्वीकृति",
      description: "विवाह, प्रदर्शनी और सामाजिक कार्यक्रमों हेतु लक्ष्मेश्वर नगर पालिका कल्याण मंडप, खुला मैदान या खेल मंडप की अग्रिम बुकिंग।",
      eligibility: "लक्ष्मेश्वर का कोई भी नागरिक या पंजीकृत सांस्कृतिक/सामाजिक संगठन।",
      expectedTimeline: "2 कार्य दिवस",
      fee: "कल्याण मंडप हेतु ₹5,000/प्रतिदिन + ₹2,000 वापसी योग्य धरोहर राशि",
      requiredDocuments: [
        "आयोजक का आधार कार्ड",
        "निवास प्रमाण पत्र",
        "ध्वनि एवं प्लास्टिक प्रतिबंध अनुपालन शपथ पत्र",
        "पुलिस थाना सूचना प्रति",
      ],
    },
  },
  "SRV-LMC-GRV-007": {
    kn: {
      name: "ಶಾಸನಬದ್ಧ ಶ್ರೇಣೀಕರಣದೊಂದಿಗೆ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿವಾರಣೆ",
      category: "ಕುಂದುಕೊರತೆ ಸೇವೆಗಳು",
      department: "ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿವಾರಣಾ ಕೋಶ",
      description: "ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ, ಬೀದಿದೀಪ ದುರಸ್ತಿ, ರಸ್ತೆ ಗುಂಡಿ, ಅಕ್ರಮ ನಿರ್ಮಾಣ ಅಥವಾ ಒಳಚರಂಡಿ ಸೋರಿಕೆ ಕುರಿತು ಖಚಿತ ಎಸ್‌ಎಲ್‌ಎ ಕಾಲಮಿತಿಯೊಂದಿಗೆ ದೂರು ಸಲ್ಲಿಕೆ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರ ನಗರ ಪುರಸಭಾ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ವಾಸಿಸುವ ಅಥವಾ ಭೇಟಿ ನೀಡುವ ಯಾವುದೇ ನಾಗರಿಕರು.",
      expectedTimeline: "ಗಂಭೀರತೆಗೆ ಅನುಗುಣವಾಗಿ 24 ರಿಂದ 72 ಗಂಟೆಗಳು",
      fee: "ಉಚಿತ",
      requiredDocuments: [
        "ವಾರ್ಡ್ ಸಂಖ್ಯೆ ಮತ್ತು ಬೀದಿ ಗುರುತು",
        "ಫೋಟೋ ಸಾಕ್ಷ್ಯ (ಐಚ್ಛಿಕ)",
        "ಟ್ರ್ಯಾಕಿಂಗ್ ಅಪ್‌ಡೇಟ್‌ಗಾಗಿ ಚಾಲ್ತಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      ],
    },
    hi: {
      name: "वैधानिक निवारण एवं स्वचालित अग्रेषण शिकायत निवारण",
      category: "शिकायत सेवाएं",
      department: "सार्वजनिक शिकायत निवारण प्रकोष्ठ",
      description: "पेयजल किल्लत, स्ट्रीट लाइट बंद, सड़क गड्ढे, अवैध निर्माण अथवा सीवेज रिसाव की त्वरित व समयबद्ध शिकायत दर्ज करना।",
      eligibility: "लक्ष्मेश्वर नगर पालिका क्षेत्र में रहने वाले या आने वाले सभी नागरिक।",
      expectedTimeline: "श्रेणी की गंभीरता अनुसार 24 से 72 घंटे",
      fee: "निःशुल्क",
      requiredDocuments: [
        "वार्ड नंबर एवं लैंडमार्क",
        "शिकायत का फोटो प्रमाण (वैकल्पिक)",
        "अपडेट प्राप्त करने हेतु सक्रिय मोबाइल नंबर",
      ],
    },
  },
  "SRV-LMC-EMG-008": {
    kn: {
      name: "24x7 ಪುರಸಭೆ ವಿಪತ್ತು ನಿಯಂತ್ರಣ ಕೊಠಡಿ ಮತ್ತು ತುರ್ತು ಸ್ಪಂದನೆ",
      category: "ತುರ್ತು ಸಂಪರ್ಕಗಳು",
      department: "ವಿಪತ್ತು ನಿರ್ವಹಣೆ ಮತ್ತು ನಿಯಂತ್ರಣ ಕೊಠಡಿ",
      description: "ಪ್ರವಾಹ, ಮರ ಬಿದ್ದಾಗ, ಪೈಪ್‌ಲೈನ್ ಒಡೆದಾಗ, ಗೋಡೆ ಕುಸಿತ ಮತ್ತು ಪುರಸಭೆಯ ತುರ್ತು ವೈದ್ಯಕೀಯ ರಕ್ಷಣೆಗೆ ತಕ್ಷಣದ ಸಹಾಯ.",
      eligibility: "ಲಕ್ಷ್ಮೇಶ್ವರ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಮಾನವ ಪ್ರಾಣ, ಸುರಕ್ಷತೆ ಮತ್ತು ಆಸ್ತಿಯ ತುರ್ತು ಸಂದರ್ಭಗಳಲ್ಲಿ ತಕ್ಷಣದ ಆದ್ಯತೆಯ ಸ್ಪಂದನೆ.",
      expectedTimeline: "ತಕ್ಷಣದ ರವಾನೆ (15 ನಿಮಿಷಗಳ ಒಳಗೆ)",
      fee: "ಉಚಿತ ತುರ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆ",
      requiredDocuments: [
        "ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆಗಳ ಅಗತ್ಯವಿಲ್ಲ - ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ",
      ],
    },
    hi: {
      name: "24x7 नगर पालिका आपदा नियंत्रण कक्ष एवं आपातकालीन प्रतिक्रिया",
      category: "आपातकालीन संपर्क",
      department: "आपदा प्रबंधन एवं नियंत्रण कक्ष",
      description: "बाढ़, आंधी से पेड़ गिरना, पाइपलाइन फटना, दीवार गिरना और त्वरित नगरपालिका आपातकालीन चिकित्सा बचाव हेतु तत्काल सहायता।",
      eligibility: "लक्ष्मेश्वर में मानव जीवन, सुरक्षा और संपत्ति की आपात स्थितियों हेतु त्वरित प्राथमिकता।",
      expectedTimeline: "तत्काल प्रेषण (15 मिनट के भीतर)",
      fee: "निःशुल्क आपातकालीन सार्वजनिक सेवा",
      requiredDocuments: [
        "आपात स्थिति में किसी दस्तावेज की आवश्यकता नहीं - सीधे हेल्पलाइन पर कॉल करें",
      ],
    },
  },
};

export const CATEGORY_TRANSLATIONS: Record<
  string,
  { kn: string; hi: string }
> = {
  "All Services": { kn: "ಎಲ್ಲಾ ಸೇವೆಗಳು", hi: "सभी सेवाएं" },
  "Water Services": { kn: "ಕುಡಿಯುವ ನೀರು ಸೇವೆಗಳು", hi: "जल सेवाएं" },
  "Sanitation & Waste Management": { kn: "ನೈರ್ಮಲ್ಯ ಮತ್ತು ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ", hi: "स्वच्छता एवं अपशिष्ट प्रबंधन" },
  "Property & Khata Services": { kn: "ಆಸ್ತಿ ಮತ್ತು ಖಾತಾ ಸೇವೆಗಳು", hi: "संपत्ति एवं खाता सेवाएं" },
  "Birth & Death Registry": { kn: "ಜನನ ಮತ್ತು ಮರಣ ನೋಂದಣಿ", hi: "जन्म एवं मृत्यु पंजीकरण" },
  "Certificates & Licenses": { kn: "ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಪರವಾನಗಿಗಳು", hi: "प्रमाणपत्र एवं लाइसेंस" },
  "Municipal Applications": { kn: "ಪುರಸಭೆ ಅರ್ಜಿಗಳು", hi: "नगर पालिका आवेदन" },
  "Grievance Services": { kn: "ಕುಂದುಕೊರತೆ ಸೇವೆಗಳು", hi: "शिकायत सेवाएं" },
  "Emergency Contacts": { kn: "ತುರ್ತು ಸಂಪರ್ಕಗಳು", hi: "आपातकालीन संपर्क" },
};

export const DEPARTMENT_TRANSLATIONS: Record<
  string,
  { kn: string; hi: string }
> = {
  "Water Supply & Engineering Section": { kn: "ನೀರು ಸರಬರಾಜು ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್ ವಿಭಾಗ", hi: "जल आपूर्ति एवं इंजीनियरिंग अनुभाग" },
  "Public Health & Sanitation Section": { kn: "ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ ವಿಭಾಗ", hi: "सार्वजनिक स्वास्थ्य एवं स्वच्छता अनुभाग" },
  "Town Revenue & Khata Department": { kn: "ನಗರ ಕಂದಾಯ ಮತ್ತು ಖಾತಾ ಇಲಾಖೆ", hi: "नगर राजस्व एवं खाता विभाग" },
  "Civil Registrar of Births & Deaths": { kn: "ಜನನ ಮತ್ತು ಮರಣಗಳ ಸಾರ್ವಜನಿಕ ನೊಂದಣಾಧಿಕಾರಿ", hi: "जन्म एवं मृत्यु रजिस्ट्रार कार्यालय" },
  "Town Planning & Building Sanction": { kn: "ನಗರ ಯೋಜನೆ ಮತ್ತು ಕಟ್ಟಡ ಅನುಮೋದನೆ", hi: "नगर नियोजन एवं भवन स्वीकृति" },
  "Trade Licensing & Commercial Cell": { kn: "ವ್ಯಾಪಾರ ಪರವಾನಗಿ ಮತ್ತು ವಾಣಿಜ್ಯ ಕೋಶ", hi: "व्यापार लाइसेंसिंग एवं वाणिज्यिक प्रकोष्ठ" },
  "Public Grievance Redressal Cell": { kn: "ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿವಾರಣಾ ಕೋಶ", hi: "सार्वजनिक शिकायत निवारण प्रकोष्ठ" },
  "Disaster Management & Control Room": { kn: "ವಿಪತ್ತು ನಿರ್ವಹಣೆ ಮತ್ತು ನಿಯಂತ್ರಣ ಕೊಠಡಿ", hi: "आपदा प्रबंधन एवं नियंत्रण कक्ष" },
};

export function getServiceTranslation(
  identifier: { id?: string; name?: string; category?: string },
  lang: string
): ServiceTranslationItem | null {
  if (lang !== "kn" && lang !== "hi") return null;

  // 1. Direct ID lookup
  if (identifier.id && SERVICES_TRANSLATIONS[identifier.id]) {
    return SERVICES_TRANSLATIONS[identifier.id][lang as "kn" | "hi"];
  }

  // 2. Case-insensitive / trimmed ID lookup
  if (identifier.id) {
    const cleanId = identifier.id.trim().toUpperCase();
    for (const key of Object.keys(SERVICES_TRANSLATIONS)) {
      if (key.toUpperCase() === cleanId) {
        return SERVICES_TRANSLATIONS[key][lang as "kn" | "hi"];
      }
    }
  }

  // 3. Match by name or category heuristic
  if (identifier.name) {
    const nameLow = identifier.name.toLowerCase();
    if (nameLow.includes("water") || nameLow.includes("piped")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-WAT-001"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("sewer") || nameLow.includes("sanitation") || nameLow.includes("drainage")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-SAN-002"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("khata") || nameLow.includes("swathu") || nameLow.includes("property")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-PROP-003"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("birth") || nameLow.includes("death")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-REG-004"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("trade") || nameLow.includes("license") || nameLow.includes("commercial")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-CERT-005"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("hall") || nameLow.includes("community") || nameLow.includes("ground")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-APP-006"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("grievance") || nameLow.includes("complaint")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-GRV-007"][lang as "kn" | "hi"];
    }
    if (nameLow.includes("disaster") || nameLow.includes("emergency") || nameLow.includes("control")) {
      return SERVICES_TRANSLATIONS["SRV-LMC-EMG-008"][lang as "kn" | "hi"];
    }
  }

  // 4. Match by category
  if (identifier.category) {
    const catLow = identifier.category.toLowerCase();
    if (catLow.includes("water")) return SERVICES_TRANSLATIONS["SRV-LMC-WAT-001"][lang as "kn" | "hi"];
    if (catLow.includes("sanitation")) return SERVICES_TRANSLATIONS["SRV-LMC-SAN-002"][lang as "kn" | "hi"];
    if (catLow.includes("property")) return SERVICES_TRANSLATIONS["SRV-LMC-PROP-003"][lang as "kn" | "hi"];
    if (catLow.includes("birth")) return SERVICES_TRANSLATIONS["SRV-LMC-REG-004"][lang as "kn" | "hi"];
    if (catLow.includes("certificate")) return SERVICES_TRANSLATIONS["SRV-LMC-CERT-005"][lang as "kn" | "hi"];
    if (catLow.includes("application")) return SERVICES_TRANSLATIONS["SRV-LMC-APP-006"][lang as "kn" | "hi"];
    if (catLow.includes("grievance")) return SERVICES_TRANSLATIONS["SRV-LMC-GRV-007"][lang as "kn" | "hi"];
    if (catLow.includes("emergency")) return SERVICES_TRANSLATIONS["SRV-LMC-EMG-008"][lang as "kn" | "hi"];
  }

  return null;
}

